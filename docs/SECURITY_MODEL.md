# SABIT-LOCAL 安全模型

## 概述

SABIT-LOCAL 系統的核心功能是管理加密貨幣交易所的 API 密鑰，並使用這些密鑰執行交易操作。由於 API 密鑰具有高度敏感性，可直接控制用戶的資產，因此系統採用了多層次的安全措施來保護這些敏感數據。

## 安全設計原則

1. **本地化存儲**: 所有數據僅存儲在用戶本地設備，不上傳至任何外部服務器
2. **加密存儲**: 敏感數據在存儲前進行強加密
3. **最小權限原則**: 僅在必要時解密和使用敏感數據
4. **內存安全**: 敏感數據使用後從內存中清除
5. **安全默認值**: 系統預設使用測試模式，避免意外操作真實資產

## 密鑰加密機制

### 1. 加密算法選擇

系統使用 `cryptography` 庫中的 Fernet 對稱加密算法，這是一種現代、安全的加密方式：

- 基於 AES-128-CBC 加密算法
- 包含消息認證碼 (MAC) 防止篡改
- 包含隨機初始化向量 (IV) 防止重放攻擊

### 2. 密鑰派生

系統不直接使用用戶提供的主密碼進行加密，而是使用 PBKDF2 (Password-Based Key Derivation Function 2) 從主密碼派生加密密鑰：

```python
def _derive_key(self):
    """從主密碼派生加密密鑰"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=self.salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(self.master_password.encode()))
    return key
```

這種方式具有以下優點：
- 使用 SHA-256 雜湊算法
- 使用隨機鹽值增強安全性
- 使用 100,000 次迭代增加暴力破解難度
- 生成標準長度的 256 位密鑰

### 3. 鹽值管理

系統使用隨機生成的鹽值，並將其存儲在獨立的文件中：

```python
def _get_or_create_salt(self):
    """獲取或創建鹽值"""
    if self.salt_file.exists():
        with open(self.salt_file, "rb") as f:
            return f.read()
    else:
        # 創建目錄（如果不存在）
        self.salt_file.parent.mkdir(parents=True, exist_ok=True)
        # 生成新的鹽值
        salt = os.urandom(16)
        with open(self.salt_file, "wb") as f:
            f.write(salt)
        return salt
```

鹽值的使用增加了安全性：
- 防止使用預先計算的雜湊表（彩虹表）攻擊
- 即使多個用戶使用相同的主密碼，也會生成不同的加密密鑰
- 鹽值與數據庫分離存儲，增加了安全層級

## 數據存儲安全

### 1. 數據庫模型

API 密鑰存儲在 SQLite 數據庫中，使用以下模型：

```python
class ExchangeKey(Base):
    """交易所 API 密鑰模型"""
    __tablename__ = "exchange_keys"

    id = Column(Integer, primary_key=True, index=True)
    exchange_id = Column(String(50), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    api_key = Column(Text, nullable=False)  # 加密的 API Key
    api_secret = Column(Text, nullable=False)  # 加密的 API Secret
    api_password = Column(Text, nullable=True)  # 加密的 API 密碼
    is_active = Column(Boolean, default=True)
    test_mode = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

重要安全特點：
- API 密鑰、密碼等敏感數據以加密形式存儲
- 默認啟用測試模式，避免意外操作真實資產
- 記錄創建和更新時間，便於審計

### 2. 數據庫文件安全

SQLite 數據庫文件存儲在用戶本地設備的指定目錄中：

```python
# 確保數據庫目錄存在
DB_DIR = Path("data")
DB_DIR.mkdir(exist_ok=True)

# 數據庫 URL
SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///{DB_DIR}/sabit_local.db"
```

數據庫安全考量：
- 數據庫僅在本地存儲，不上傳至外部服務器
- 所有敏感數據均以加密形式存儲
- 即使數據庫文件被獲取，沒有主密碼也無法解密敏感數據

## 運行時安全

### 1. 密鑰使用流程

當需要使用 API 密鑰進行交易操作時，系統遵循以下安全流程：

```python
async def get_exchange(self, key_id: int) -> ccxt_async.Exchange:
    """根據密鑰 ID 獲取交易所實例"""
    # 檢查緩存
    if key_id in self.exchanges:
        return self.exchanges[key_id]
    
    # 獲取密鑰
    result = await self.db.execute(
        select(ExchangeKey).where(ExchangeKey.id == key_id)
    )
    key = result.scalars().first()
    
    if not key:
        raise ValueError(f"找不到 ID 為 {key_id} 的交易所密鑰")
        
    # 解密密鑰
    api_key = self.crypto_manager.decrypt(key.api_key)
    api_secret = self.crypto_manager.decrypt(key.api_secret)
    api_password = self.crypto_manager.decrypt(key.api_password) if key.api_password else None
    
    # 創建交易所實例
    # ...
    
    # 緩存交易所實例
    self.exchanges[key_id] = exchange
    return exchange
```

安全特點：
- 敏感數據僅在需要時解密
- 解密後的數據僅在內存中使用，不再持久化
- 使用緩存減少解密操作次數，提高性能

### 2. 資源釋放

系統確保在使用完畢後釋放資源，清除敏感數據：

```python
async def close_all_exchanges(self):
    """關閉所有交易所連接"""
    for exchange in self.exchanges.values():
        await exchange.close()
    self.exchanges = {}
```

安全特點：
- 使用完畢後關閉連接
- 清除內存中的交易所實例
- 減少敏感數據在內存中的停留時間

### 3. 依賴注入安全

系統使用 FastAPI 的依賴注入系統確保資源的安全使用：

```python
# 獲取交易所服務
async def get_exchange_service(db: AsyncSession = Depends(get_db)):
    service = ExchangeService(db, crypto_manager)
    try:
        yield service
    finally:
        await service.close_all_exchanges()
```

安全特點：
- 確保每次請求結束後都會釋放資源
- 即使發生異常也能正確清理資源
- 減少資源洩漏和敏感數據暴露的風險

## 前端安全措施

### 1. 密碼輸入保護

前端表單中的敏感數據輸入使用密碼類型，避免明文顯示：

```jsx
<FormField
  control={form.control}
  name="api_key"
  render={({ field }) => (
    <FormItem>
      <FormLabel>API Key</FormLabel>
      <FormControl>
        <Input type="password" placeholder="API Key" {...field} />
      </FormControl>
      <FormDescription>
        從交易所獲取的 API Key
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 2. 數據傳輸安全

前端與後端之間的數據傳輸採用 HTTPS 協議，確保數據在傳輸過程中的安全：

```jsx
// 發送 HTTP POST 請求到後端
const response = await axios.post('http://localhost:8000/api/exchanges/keys', data);
```

在生產環境中，應配置 HTTPS 以加密數據傳輸。

### 3. 無本地存儲

前端不會在本地存儲或緩存任何敏感數據：

- 不使用 localStorage 或 sessionStorage 存儲敏感數據
- 不在 cookies 中存儲敏感數據
- 表單提交後清除輸入數據

```jsx
// 重置表單
form.reset();
```

## 測試模式安全機制

系統默認使用測試模式，避免意外操作真實資產：

```python
# 設置測試模式（如果支持）
if key.test_mode:
    if key.exchange_id in ['binance', 'bitmex', 'bybit', 'okex', 'huobi']:
        exchange_params['options'] = {'defaultType': 'future'}
        
        if key.exchange_id == 'binance':
            exchange_params['options']['test'] = True
        elif key.exchange_id == 'bitmex':
            exchange_params['urls'] = {'api': ccxt_async.bitmex().urls['test']}
        elif key.exchange_id == 'bybit':
            exchange_params['urls'] = {'api': ccxt_async.bybit().urls['test']}
```

測試模式的優點：
- 使用交易所提供的測試環境
- 可以測試所有功能而不影響真實資產
- 用戶必須明確選擇禁用測試模式才能操作真實資產

## 主密碼管理

系統使用環境變量或直接提供的主密碼進行加密操作：

```python
def __init__(self, master_password=None):
    """初始化加密管理器"""
    self.salt_file = Path("config/salt.key")
    self.salt = self._get_or_create_salt()
    self.master_password = master_password or os.environ.get("SABIT_MASTER_PASSWORD")
    
    if not self.master_password:
        raise ValueError("必須提供主密碼或設置 SABIT_MASTER_PASSWORD 環境變數")
        
    self.key = self._derive_key()
    self.cipher = Fernet(self.key)
```

主密碼安全建議：
- 在生產環境中使用環境變量設置主密碼
- 不要在代碼或配置文件中硬編碼主密碼
- 使用足夠複雜的主密碼
- 定期更換主密碼

## 安全最佳實踐建議

1. **主密碼管理**:
   - 使用強密碼作為主密碼
   - 不要與其他服務共用相同的密碼
   - 定期更換主密碼
   - 使用密碼管理器生成和存儲主密碼

2. **API 密鑰權限**:
   - 在交易所中創建 API 密鑰時，僅授予必要的權限
   - 如果不需要提款功能，不要授予提款權限
   - 設置 API 密鑰的 IP 白名單
   - 定期輪換 API 密鑰

3. **系統安全**:
   - 確保運行 SABIT-LOCAL 的設備有良好的系統安全措施
   - 使用防火牆和防病毒軟件
   - 保持系統和軟件更新
   - 避免在公共或不安全的設備上使用

4. **數據備份**:
   - 定期備份數據庫和鹽值文件
   - 確保備份也是加密的
   - 存儲備份在安全的位置

5. **監控與審計**:
   - 定期檢查交易記錄
   - 啟用交易所的安全通知
   - 監控異常活動

## 結論

SABIT-LOCAL 系統採用多層次的安全措施來保護用戶的 API 密鑰和交易操作。通過本地化存儲、強加密、最小權限原則和內存安全等機制，系統提供了一個安全可靠的加密貨幣交易環境。然而，安全是一個持續的過程，用戶仍需遵循安全最佳實踐，確保系統和數據的安全。 