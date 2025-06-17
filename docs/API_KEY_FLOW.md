# API 密鑰數據流程詳解

本文檔詳細說明 SABIT-LOCAL 系統中 API 密鑰從創建到使用的完整流程，包括代碼級別的數據流轉。

## 一、API 密鑰創建流程

### 序列圖

```
┌──────────┐          ┌───────────┐          ┌────────────┐          ┌─────────────┐          ┌────────────┐
│          │          │           │          │            │          │             │          │            │
│  用戶    │          │  前端表單  │          │  後端路由   │          │  加密服務    │          │  數據庫    │
│          │          │           │          │            │          │             │          │            │
└────┬─────┘          └─────┬─────┘          └──────┬─────┘          └──────┬──────┘          └──────┬─────┘
     │                      │                       │                       │                       │
     │ 輸入API密鑰信息       │                       │                       │                       │
     │─────────────────────>│                       │                       │                       │
     │                      │                       │                       │                       │
     │                      │ 表單驗證              │                       │                       │
     │                      │───────────────────────│                       │                       │
     │                      │                       │                       │                       │
     │                      │ POST /api/exchanges/keys                      │                       │
     │                      │──────────────────────>│                       │                       │
     │                      │                       │                       │                       │
     │                      │                       │ 加密API密鑰           │                       │
     │                      │                       │──────────────────────>│                       │
     │                      │                       │                       │                       │
     │                      │                       │                       │ 返回加密結果          │
     │                      │                       │<──────────────────────│                       │
     │                      │                       │                       │                       │
     │                      │                       │ 存儲加密密鑰          │                       │
     │                      │                       │──────────────────────────────────────────────>│
     │                      │                       │                       │                       │
     │                      │                       │                       │                       │ 返回存儲結果
     │                      │                       │<──────────────────────────────────────────────│
     │                      │                       │                       │                       │
     │                      │ 返回成功響應          │                       │                       │
     │                      │<──────────────────────│                       │                       │
     │                      │                       │                       │                       │
     │ 顯示成功訊息         │                       │                       │                       │
     │<─────────────────────│                       │                       │                       │
     │                      │                       │                       │                       │
```

### 代碼流程

#### 1. 前端表單輸入 (ExchangeKeyForm.jsx)

```jsx
// 用戶在表單中輸入 API 密鑰信息
const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    // 發送 HTTP POST 請求到後端
    const response = await axios.post('http://localhost:8000/api/exchanges/keys', data);
    toast({
      title: "成功",
      description: "交易所 API 密鑰已保存",
    });
    
    // 重置表單
    form.reset();
    
    // 調用成功回調
    if (onSuccess) {
      onSuccess(response.data);
    }
  } catch (error) {
    console.error('保存 API 密鑰失敗:', error);
    toast({
      title: "錯誤",
      description: error.response?.data?.detail || "保存 API 密鑰失敗",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

#### 2. 後端路由處理 (exchange.py)

```python
@router.post("/keys", response_model=ExchangeKeyResponse)
async def create_exchange_key(
    key_data: ExchangeKeyCreate,
    db: AsyncSession = Depends(get_db)
):
    """創建新的交易所 API 密鑰"""
    # 加密敏感數據
    encrypted_api_key = crypto_manager.encrypt(key_data.api_key)
    encrypted_api_secret = crypto_manager.encrypt(key_data.api_secret)
    encrypted_api_password = crypto_manager.encrypt(key_data.api_password) if key_data.api_password else None
    
    # 創建數據庫記錄
    db_key = ExchangeKey(
        exchange_id=key_data.exchange_id,
        name=key_data.name,
        api_key=encrypted_api_key,
        api_secret=encrypted_api_secret,
        api_password=encrypted_api_password,
        test_mode=key_data.test_mode
    )
    
    db.add(db_key)
    await db.commit()
    await db.refresh(db_key)
    
    return db_key
```

#### 3. 加密處理 (crypto.py)

```python
def encrypt(self, data):
    """
    加密數據
    
    Args:
        data: 要加密的字符串
        
    Returns:
        加密後的字符串
    """
    if not isinstance(data, str):
        raise TypeError("加密數據必須是字符串")
        
    encrypted = self.cipher.encrypt(data.encode())
    return encrypted.decode()
```

#### 4. 數據庫存儲 (database.py 和 models/exchange_keys.py)

```python
# 數據模型定義 (models/exchange_keys.py)
class ExchangeKey(Base):
    """交易所 API 密鑰模型"""
    __tablename__ = "exchange_keys"

    id = Column(Integer, primary_key=True, index=True)
    exchange_id = Column(String(50), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    api_key = Column(Text, nullable=False)
    api_secret = Column(Text, nullable=False)
    api_password = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    test_mode = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# 數據庫操作 (在路由處理中)
db.add(db_key)
await db.commit()
await db.refresh(db_key)
```

## 二、API 密鑰使用流程

### 序列圖

```
┌──────────┐          ┌───────────┐          ┌────────────┐          ┌─────────────┐          ┌────────────┐          ┌────────────┐
│          │          │           │          │            │          │             │          │            │          │            │
│  用戶    │          │  交易頁面  │          │  後端路由   │          │  交易服務    │          │  加密服務   │          │  交易所API  │
│          │          │           │          │            │          │             │          │            │          │            │
└────┬─────┘          └─────┬─────┘          └──────┬─────┘          └──────┬──────┘          └──────┬─────┘          └──────┬─────┘
     │                      │                       │                       │                       │                       │
     │ 選擇密鑰和交易參數    │                       │                       │                       │                       │
     │─────────────────────>│                       │                       │                       │                       │
     │                      │                       │                       │                       │                       │
     │                      │ POST /{key_id}/orders │                       │                       │                       │
     │                      │──────────────────────>│                       │                       │                       │
     │                      │                       │                       │                       │                       │
     │                      │                       │ 調用 create_order     │                       │                       │
     │                      │                       │──────────────────────>│                       │                       │
     │                      │                       │                       │                       │                       │
     │                      │                       │                       │ 從數據庫獲取密鑰      │                       │
     │                      │                       │                       │───────────────────────│                       │
     │                      │                       │                       │                       │                       │
     │                      │                       │                       │ 解密 API 密鑰         │                       │
     │                      │                       │                       │───────────────────────│                       │
     │                      │                       │                       │                       │                       │
     │                      │                       │                       │ 返回解密結果          │                       │
     │                      │                       │                       │<───────────────────────│                       │
     │                      │                       │                       │                       │                       │
     │                      │                       │                       │ 調用交易所 API        │                       │
     │                      │                       │                       │──────────────────────────────────────────────>│
     │                      │                       │                       │                       │                       │
     │                      │                       │                       │                       │                       │ 執行交易
     │                      │                       │                       │                       │                       │───────┐
     │                      │                       │                       │                       │                       │       │
     │                      │                       │                       │                       │                       │<──────┘
     │                      │                       │                       │                       │                       │
     │                      │                       │                       │ 返回交易結果          │                       │
     │                      │                       │                       │<──────────────────────────────────────────────│
     │                      │                       │                       │                       │                       │
     │                      │                       │ 返回處理結果          │                       │                       │
     │                      │                       │<──────────────────────│                       │                       │
     │                      │                       │                       │                       │                       │
     │                      │ 返回 API 響應         │                       │                       │                       │
     │                      │<──────────────────────│                       │                       │                       │
     │                      │                       │                       │                       │                       │
     │ 顯示交易結果         │                       │                       │                       │                       │
     │<─────────────────────│                       │                       │                       │                       │
     │                      │                       │                       │                       │                       │
```

### 代碼流程

#### 1. 前端交易操作 (TradingPage.jsx)

```jsx
// 提交訂單表單
const onOrderSubmit = async (data) => {
  setIsLoading(true);
  try {
    const payload = {
      symbol: data.symbol,
      order_type: data.order_type,
      side: data.side,
      amount: data.amount,
      price: data.order_type === 'limit' ? data.price : undefined,
    };
    
    // 發送交易請求到後端
    const response = await axios.post(`http://localhost:8000/api/exchanges/${data.key_id}/orders`, payload);
    
    toast({
      title: "成功",
      description: `${data.side === 'buy' ? '買入' : '賣出'} ${data.amount} ${data.symbol} 訂單已提交`,
    });
    
    // 重新獲取數據
    fetchOpenOrders(data.key_id);
    fetchPositions(data.key_id);
    
  } catch (error) {
    console.error('創建訂單失敗:', error);
    toast({
      title: "錯誤",
      description: error.response?.data?.detail || "創建訂單失敗",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

#### 2. 後端路由處理 (exchange.py)

```python
@router.post("/{key_id}/orders")
async def create_order(
    key_id: int,
    order_data: OrderRequest,
    service: ExchangeService = Depends(get_exchange_service)
):
    """創建訂單"""
    try:
        return await service.create_order(
            key_id=key_id,
            symbol=order_data.symbol,
            order_type=order_data.order_type,
            side=order_data.side,
            amount=order_data.amount,
            price=order_data.price,
            params=order_data.params
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
```

#### 3. 交易服務處理 (exchange_service.py)

```python
async def create_order(self, key_id: int, symbol: str, order_type: str, 
                      side: str, amount: float, price: Optional[float] = None,
                      params: Dict = None) -> Dict:
    """
    創建訂單
    
    Args:
        key_id: 密鑰 ID
        symbol: 交易對符號
        order_type: 訂單類型 (market, limit)
        side: 交易方向 (buy, sell)
        amount: 數量
        price: 價格 (僅限價單需要)
        params: 額外參數
        
    Returns:
        訂單信息
    """
    # 獲取交易所實例
    exchange = await self.get_exchange(key_id)
    params = params or {}
    
    try:
        # 調用 CCXT 創建訂單
        return await exchange.create_order(
            symbol=symbol,
            type=order_type,
            side=side,
            amount=amount,
            price=price,
            params=params
        )
    except Exception as e:
        logger.error(f"創建訂單失敗: {e}")
        raise
```

#### 4. 獲取和解密 API 密鑰 (exchange_service.py)

```python
async def get_exchange(self, key_id: int) -> ccxt_async.Exchange:
    """
    根據密鑰 ID 獲取交易所實例
    
    Args:
        key_id: 密鑰 ID
        
    Returns:
        交易所實例
    """
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
    exchange_class = getattr(ccxt_async, key.exchange_id)
    
    exchange_params = {
        'apiKey': api_key,
        'secret': api_secret,
        'enableRateLimit': True,
    }
    
    if api_password:
        exchange_params['password'] = api_password
        
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
                
    exchange = exchange_class(exchange_params)
    
    # 緩存交易所實例
    self.exchanges[key_id] = exchange
    return exchange
```

#### 5. 解密處理 (crypto.py)

```python
def decrypt(self, encrypted_data):
    """
    解密數據
    
    Args:
        encrypted_data: 加密的字符串
        
    Returns:
        解密後的字符串
    """
    if not isinstance(encrypted_data, str):
        raise TypeError("加密數據必須是字符串")
        
    decrypted = self.cipher.decrypt(encrypted_data.encode())
    return decrypted.decode()
```

## 三、API 密鑰安全性考量

### 1. 加密存儲

API 密鑰在存儲前使用 Fernet 對稱加密算法進行加密，加密密鑰通過 PBKDF2 從主密碼派生。這確保了即使數據庫文件被獲取，沒有主密碼也無法解密 API 密鑰。

```python
# 從主密碼派生加密密鑰
def _derive_key(self):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=self.salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(self.master_password.encode()))
    return key
```

### 2. 鹽值管理

系統使用隨機生成的鹽值增強密碼安全性，鹽值存儲在獨立的文件中，與數據庫分離。

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

### 3. 內存安全

解密後的 API 密鑰僅在內存中使用，不會再次持久化存儲。交易所實例在使用後會被適當關閉，釋放資源。

```python
async def close_all_exchanges(self):
    """關閉所有交易所連接"""
    for exchange in self.exchanges.values():
        await exchange.close()
    self.exchanges = {}
```

## 四、完整數據流程總結

1. **API 密鑰創建**:
   - 用戶在前端輸入 API 密鑰信息
   - 前端進行表單驗證
   - 前端發送 HTTP 請求到後端
   - 後端使用 CryptoManager 加密 API 密鑰
   - 加密後的密鑰存入 SQLite 數據庫
   - 返回成功響應給前端

2. **API 密鑰使用**:
   - 用戶在交易頁面選擇密鑰和交易參數
   - 前端發送交易請求到後端
   - 後端路由調用 ExchangeService
   - ExchangeService 從數據庫獲取加密的密鑰
   - 使用 CryptoManager 解密密鑰
   - 創建交易所實例並配置 API 密鑰
   - 調用交易所 API 執行交易
   - 返回交易結果給前端
   - 前端顯示交易結果給用戶

3. **安全機制**:
   - 使用 PBKDF2 派生加密密鑰
   - 使用 Fernet 對稱加密算法
   - 使用隨機鹽值增強安全性
   - 密鑰僅在內存中解密使用
   - 使用完畢後關閉連接釋放資源

這種設計確保了 API 密鑰的安全存儲和使用，同時提供了良好的用戶體驗和系統性能。 