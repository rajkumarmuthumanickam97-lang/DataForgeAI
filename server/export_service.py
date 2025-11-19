import json
import pandas as pd
from typing import List, Dict, Any, Tuple
from schemas import ExportFormat
import xml.etree.ElementTree as ET

def export_data(data: List[Dict[str, Any]], format: ExportFormat) -> Tuple[bytes, str, str]:
    df = pd.DataFrame(data)
    return export_data_pandas(df, format)

def export_data_pandas(df: pd.DataFrame, format: ExportFormat) -> Tuple[bytes, str, str]:
    if format == "json":
        json_str = df.to_json(orient='records', indent=2)
        content = (json_str or "[]").encode('utf-8')
        return content, "application/json", "json"
    
    elif format == "csv":
        content = df.to_csv(index=False).encode('utf-8')
        return content, "text/csv", "csv"
    
    elif format == "xml":
        data = df.to_dict(orient='records')
        root = ET.Element("data")
        for item in data:
            row = ET.SubElement(root, "row")
            for key, value in item.items():
                field = ET.SubElement(row, key)
                field.text = str(value)
        
        xml_string = ET.tostring(root, encoding='unicode')
        content = xml_string.encode('utf-8')
        return content, "application/xml", "xml"
    
    else:
        raise ValueError(f"Unsupported export format: {format}")
