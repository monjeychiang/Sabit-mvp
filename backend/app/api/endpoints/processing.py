from fastapi import APIRouter, BackgroundTasks
import time
from typing import List, Dict, Any
import random
import asyncio

from app.core.worker import TaskManager

router = APIRouter()

# 模擬耗時的處理任務
def process_item(item: int, factor: float = 1.0) -> Dict[str, Any]:
    """模擬一個耗時的處理任務"""
    # 模擬隨機處理時間
    process_time = random.uniform(0.1, 0.5) * factor
    time.sleep(process_time)
    
    return {
        "item": item,
        "result": item * factor,
        "process_time": process_time
    }

# 創建一個任務管理器實例
task_manager = TaskManager()

@router.post("/process-batch")
async def process_batch(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    使用多核心並行處理一批數據
    
    請求體格式:
    ```json
    {
        "items": [1, 2, 3, 4, 5],
        "factor": 2.0
    }
    ```
    """
    items = data.get("items", [])
    factor = data.get("factor", 1.0)
    
    if not items:
        return {"message": "未提供處理項目", "results": []}
    
    # 使用 asyncio.to_thread 將阻塞操作轉移到執行緒池
    results = await asyncio.to_thread(
        task_manager.map,
        process_item,
        items,
        factor=factor
    )
    
    return {
        "message": f"已處理 {len(items)} 個項目",
        "cpu_cores_used": task_manager.max_workers,
        "results": results
    }

@router.get("/system-info")
async def get_system_info() -> Dict[str, Any]:
    """獲取系統資訊，包括可用的 CPU 核心數"""
    import os
    import psutil
    
    cpu_count = os.cpu_count()
    memory = psutil.virtual_memory()
    
    return {
        "cpu_cores": cpu_count,
        "memory_total_gb": round(memory.total / (1024**3), 2),
        "memory_available_gb": round(memory.available / (1024**3), 2),
        "memory_percent_used": memory.percent
    } 