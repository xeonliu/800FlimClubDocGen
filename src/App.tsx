import { useState, useMemo } from "react";
import "./App.css";
import DocumentPreview from "./component/document_preview";
import EditorPanel from "./component/editor_panel";
import { initialEditorState, editorFormToDocument } from "./utils/editor_utils";
import type { EditorFormData } from "./model/editor";

function App() {
  const [editorData, setEditorData] = useState<EditorFormData>(initialEditorState);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // 实时将编辑器状态转换为文档数据（用于预览）
  const documentData = useMemo(
    () => editorFormToDocument(editorData),
    [editorData]
  );

  return (
    <div className="app-layout">
      <EditorPanel
        data={editorData}
        onChange={setEditorData}
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed((v) => !v)}
      />
      <main className="preview-area">
        <DocumentPreview data={documentData} />
      </main>
    </div>
  );
}

export default App;
