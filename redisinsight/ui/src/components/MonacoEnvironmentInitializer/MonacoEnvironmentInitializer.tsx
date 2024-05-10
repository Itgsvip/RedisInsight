import { useEffect } from 'react'
import { LanguageIdEnum } from 'monaco-sql-languages'

import 'monaco-sql-languages/esm/languages/mysql/mysql.contribution'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TypeScriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import MySQLWorker from 'monaco-sql-languages/esm/languages/mysql/mysql.worker?worker'
// https://github.com/remcohaszing/monaco-yaml?tab=readme-ov-file#why-doesnt-it-work-with-vite
import YamlWorker from './yaml.worker?worker'

const MonacoEnvironmentInitializer = () => {
  useEffect(() => {
    window.MonacoEnvironment = {
      getWorker: (_workerId, label) => {
        switch (label) {
          case 'editorWorkerService':
            return new EditorWorker()
          case 'yaml':
            return new YamlWorker()
          case 'json':
            return new JSONWorker()
          case 'javascript':
          case 'typescript':
            return new TypeScriptWorker()
          case LanguageIdEnum.MYSQL:
            return new MySQLWorker()
          default:
            throw new Error(`MonacoWorker: Unknown label ${label}`)
        }
      },
    }
  }, [])

  return null
}

export default MonacoEnvironmentInitializer
