import React, { useState } from "react";

const initialData = {
  Documents: ["Document1.jpg", "Document2.jpg", "Document3.jpg"],
  Desktop: ["Screenshot1.jpg", "videopal.mp4"],
  Downloads: {
    Drivers: ["Printerdriver.dmg", "cameradriver.dmg"],
    Images: ["chromedriver.dmg"],
  },
  Applications: ["Webstorm.dmg", "Pycharm.dmg", "FileZila.dmg", "Mattermost.dmg"],
};

const FolderStructure = () => {
  const [data, setData] = useState(initialData);
  const [expandedFolders, setExpandedFolders] = useState({});

  const updateData = (path, updater) => {
    const keys = path.split(".");
    const updatedData = { ...data };
    let pointer = updatedData;

    keys.slice(0, -1).forEach((key) => {
      pointer = pointer[key];
    });

    const lastKey = keys[keys.length - 1];
    pointer[lastKey] = updater(pointer[lastKey]);

    setData(updatedData);
  };

  const handleCreate = (path, type) => {
    const name = prompt(`Enter the name of the new ${type}:`);
    if (!name) return;

    updateData(path, (current) => {
      if (Array.isArray(current)) {
        return type === "folder"
          ? [...current, { [name]: {} }]
          : [...current, name];
      } else if (typeof current === "object") {
        return {
          ...current,
          [name]: type === "folder" ? {} : name,
        };
      }
      return current;
    });
  };

  const handleEdit = (path) => {
    const newName = prompt("Enter the new name:");
    if (!newName) return;

    const keys = path.split(".");
    const updatedData = { ...data };
    let pointer = updatedData;

    keys.slice(0, -1).forEach((key) => {
      pointer = Array.isArray(pointer) ? pointer[parseInt(key, 10)] : pointer[key];
    });

    const lastKey = keys[keys.length - 1];
    if (Array.isArray(pointer)) {
      const fileIndex = parseInt(lastKey, 10);
      pointer[fileIndex] = newName;
    } else if (typeof pointer === "object") {
      const value = pointer[lastKey];
      delete pointer[lastKey];
      pointer[newName] = value;
    }

    setData(updatedData);
  };

  const handleDelete = (path) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    const keys = path.split(".");
    const updatedData = { ...data };
    let pointer = updatedData;

    keys.slice(0, -1).forEach((key) => {
      pointer = pointer[key];
    });

    delete pointer[keys[keys.length - 1]];

    setData(updatedData);
  };

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderTree = (node, path = "") => {
    const sortedEntries = Object.entries(node).sort(([keyA, valueA], [keyB, valueB]) => {
      const isFolderA = typeof valueA === "object" && !Array.isArray(valueA);
      const isFolderB = typeof valueB === "object" && !Array.isArray(valueB);
  
      if (isFolderA && !isFolderB) return -1;
      if (!isFolderA && isFolderB) return 1;
  
      return keyA.localeCompare(keyB);
    });
  
    return sortedEntries.map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const isExpanded = expandedFolders[currentPath];
  
      if (Array.isArray(value)) {
        return (
          <div key={currentPath} style={{ marginLeft: 20 }}>
            <span onClick={() => toggleFolder(currentPath)} style={{ cursor: "pointer" }}>
              {isExpanded ? "📂" : "📁"} <strong>{key}</strong>{" "}
            </span>
            {isExpanded && (
              <div style={{ marginLeft: 20 }}>
                <button onClick={() => handleCreate(currentPath, "file")}>+File</button>
                <button onClick={() => handleCreate(currentPath, "folder")}>+Folder</button>
                <button onClick={() => handleEdit(currentPath)}>Edit</button>
                <button onClick={() => handleDelete(currentPath)}>Delete</button>
                {value.map((file, index) =>
                  typeof file === "object" ? (
                    renderTree(file, `${currentPath}.${index}`)
                  ) : (
                    <div key={`${currentPath}.${index}`}>
                      📄 {file}{" "}
                      <button onClick={() => handleEdit(`${currentPath}.${index}`)}>Edit</button>
                      <button onClick={() => handleDelete(`${currentPath}.${index}`)}>Delete</button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        );
      } else if (typeof value === "object") {
        return (
          <div key={currentPath} style={{ marginLeft: 20 }}>
            <span onClick={() => toggleFolder(currentPath)} style={{ cursor: "pointer" }}>
              {isExpanded ? "📂" : "📁"} <strong>{key}</strong>{" "}
            </span>
            {isExpanded && (
              <div>
                <button onClick={() => handleCreate(currentPath, "file")}>+File</button>
                <button onClick={() => handleCreate(currentPath, "folder")}>+Folder</button>
                <button onClick={() => handleEdit(currentPath)}>Edit</button>
                <button onClick={() => handleDelete(currentPath)}>Delete</button>
                {renderTree(value, currentPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div key={currentPath} style={{ marginLeft: 20 }}>
            📄 {key}{" "}
            <button onClick={() => handleEdit(currentPath)}>Edit</button>
            <button onClick={() => handleDelete(currentPath)}>Delete</button>
          </div>
        );
      }
    });
  };
  

  return <div>{renderTree(data)}</div>;
};

export default FolderStructure;
