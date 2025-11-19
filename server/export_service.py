import json
import pandas as pd
from typing import List, Dict, Any, Tuple
from schemas import ExportFormat
import xml.etree.ElementTree as ET

def export_data(data: List[Dict[str, Any]], format: ExportFormat) -> Tuple[bytes, str, str]:
    if format == "json":
        content = json.dumps(data, indent=2).encode('utf-8')
        return content, "application/json", "json"
    
    elif format == "csv":
        df = pd.DataFrame(data)
        content = df.to_csv(index=False).encode('utf-8')
        return content, "text/csv", "csv"
    
    elif format == "xml":
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
