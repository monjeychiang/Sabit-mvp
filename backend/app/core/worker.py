import multiprocessing
import os
import time
import logging
from typing import List, Callable, Any, Dict, Optional
from concurrent.futures import ProcessPoolExecutor, as_completed
from functools import partial

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("worker")

class TaskManager:
    """
    多核心任務管理器
    
    使用 Python 的 multiprocessing 模組在多個 CPU 核心上並行執行任務。
    適合本地個人使用的多核心處理需求。
    
    用法範例:
    ```python
    # 定義要執行的任務函數
    def process_item(item, factor=1):
        result = item * factor
        time.sleep(0.1)  # 模擬耗時操作
        return result
    
    # 創建任務管理器
    manager = TaskManager()
    
    # 準備數據
    items = list(range(100))
    
    # 並行處理數據
    results = manager.map(process_item, items, factor=2)
    
    # 處理結果
    print(f"處理完成，結果數量: {len(results)}")
    ```
    """
    
    def __init__(self, max_workers: Optional[int] = None):
        """
        初始化任務管理器
        
        Args:
            max_workers: 最大工作進程數，預設為 CPU 核心數
        """
        self.max_workers = max_workers or os.cpu_count()
        logger.info(f"初始化任務管理器，最大工作進程數: {self.max_workers}")
    
    def map(self, func: Callable, items: List[Any], **kwargs) -> List[Any]:
        """
        將函數映射到項目列表，並在多個進程中並行執行
        
        Args:
            func: 要執行的函數
            items: 要處理的項目列表
            **kwargs: 傳遞給函數的其他參數
            
        Returns:
            處理結果列表，順序與輸入項目相同
        """
        if not items:
            return []
            
        start_time = time.time()
        logger.info(f"開始處理 {len(items)} 個項目，使用 {self.max_workers} 個工作進程")
        
        # 如果有額外參數，使用 partial 函數
        if kwargs:
            process_func = partial(func, **kwargs)
        else:
            process_func = func
        
        results = []
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            # 提交所有任務
            future_to_index = {
                executor.submit(process_func, item): i 
                for i, item in enumerate(items)
            }
            
            # 收集結果，保持原始順序
            results = [None] * len(items)
            for future in as_completed(future_to_index):
                index = future_to_index[future]
                try:
                    results[index] = future.result()
                except Exception as e:
                    logger.error(f"處理項目 {index} 時發生錯誤: {e}")
                    results[index] = None
        
        elapsed = time.time() - start_time
        logger.info(f"處理完成，耗時 {elapsed:.2f} 秒")
        return results
    
    def execute_tasks(self, tasks: List[Dict[str, Any]]) -> List[Any]:
        """
        執行一系列不同的任務
        
        Args:
            tasks: 任務列表，每個任務是一個字典，包含 'func' 和 'args' 鍵
                  例如: {'func': some_function, 'args': (1, 2), 'kwargs': {'a': 1}}
                  
        Returns:
            任務結果列表
        """
        if not tasks:
            return []
            
        start_time = time.time()
        logger.info(f"開始執行 {len(tasks)} 個任務，使用 {self.max_workers} 個工作進程")
        
        results = []
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            # 提交所有任務
            futures = []
            for task in tasks:
                func = task['func']
                args = task.get('args', ())
                kwargs = task.get('kwargs', {})
                futures.append(executor.submit(func, *args, **kwargs))
            
            # 收集結果
            for future in as_completed(futures):
                try:
                    results.append(future.result())
                except Exception as e:
                    logger.error(f"執行任務時發生錯誤: {e}")
                    results.append(None)
        
        elapsed = time.time() - start_time
        logger.info(f"執行完成，耗時 {elapsed:.2f} 秒")
        return results


# 為了方便使用，創建一個默認的任務管理器實例
default_manager = TaskManager()

def map_tasks(func: Callable, items: List[Any], **kwargs) -> List[Any]:
    """
    使用默認任務管理器映射任務
    """
    return default_manager.map(func, items, **kwargs)

def execute_tasks(tasks: List[Dict[str, Any]]) -> List[Any]:
    """
    使用默認任務管理器執行任務
    """
    return default_manager.execute_tasks(tasks) 