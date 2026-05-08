/**
 * 图形导出导入服务
 */

import type { DrawNode, DrawEdge } from './types'

/**
 * 导出/导入服务
 */
export class DrawExportService {
  /**
   * 导出为 JSON 文件内容
   */
  static async exportJSON(
    nodes: DrawNode[],
    edges: DrawEdge[],
    title: string = '未命名图表'
  ): Promise<string> {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      title,
      nodes,
      edges
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * 从 JSON 导入
   */
  static async importJSON(jsonString: string): Promise<{
    nodes: DrawNode[]
    edges: DrawEdge[]
    title: string
  }> {
    try {
      const data = JSON.parse(jsonString)
      return {
        nodes: data.nodes || [],
        edges: data.edges || [],
        title: data.title || '导入的图表'
      }
    } catch (error) {
      throw new Error('JSON 格式错误')
    }
  }

  /**
   * 生成 Markdown 表格形式的节点列表
   */
  static generateNodeTable(nodes: DrawNode[]): string {
    let markdown = '| ID | 名称 | 描述 | 类型 |\n'
    markdown += '|-----|------|------|------|\n'

    nodes.forEach(node => {
      const desc = node.description?.replace(/\n/g, ' ') || '-'
      markdown += `| ${node.id.substring(0, 8)} | ${node.label} | ${desc} | ${node.type} |\n`
    })

    return markdown
  }

  /**
   * 生成 Markdown 关系列表
   */
  static generateRelationList(nodes: DrawNode[], edges: DrawEdge[]): string {
    if (edges.length === 0) return '暂无连接关系'

    let markdown = ''
    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    edges.forEach(edge => {
      const fromNode = nodeMap.get(edge.fromNodeId)
      const toNode = nodeMap.get(edge.toNodeId)
      if (fromNode && toNode) {
        markdown += `- **${fromNode.label}** ${edge.label ? `(${edge.label})` : '->'} **${toNode.label}**\n`
      }
    })

    return markdown
  }

  /**
   * 导出为 Markdown 文件
   */
  static async exportMarkdown(
    nodes: DrawNode[],
    edges: DrawEdge[],
    title: string = '未命名图表',
    description: string = ''
  ): Promise<string> {
    let markdown = `# ${title}\n\n`

    if (description) {
      markdown += `${description}\n\n`
    }

    markdown += '## 概览\n\n'
    markdown += `- 节点总数：${nodes.length}\n`
    markdown += `- 连接总数：${edges.length}\n`
    markdown += `- 导出时间：${new Date().toLocaleString()}\n\n`

    markdown += '## 节点列表\n\n'
    markdown += this.generateNodeTable(nodes)
    markdown += '\n\n'

    markdown += '## 关系图\n\n'
    markdown += this.generateRelationList(nodes, edges)
    markdown += '\n\n'

    markdown += '## 详细信息\n\n'
    nodes.forEach(node => {
      markdown += `### ${node.label}\n\n`
      if (node.description) {
        markdown += `**描述:** ${node.description}\n\n`
      }
      markdown += `- **ID:** ${node.id}\n`
      markdown += `- **类型:** ${node.type}\n`
      markdown += `- **尺寸:** ${node.width} x ${node.height}\n`
      markdown += `- **位置:** (${node.x}, ${node.y})\n`
      markdown += `- **颜色:** ${node.color}\n`

      if (node.metadata && Object.keys(node.metadata).length > 0) {
        markdown += `- **元数据:**\n`
        Object.entries(node.metadata).forEach(([key, value]) => {
          markdown += `  - ${key}: ${JSON.stringify(value)}\n`
        })
      }
      markdown += '\n'
    })

    return markdown
  }

  /**
   * 导出为 CSV 格式
   */
  static async exportCSV(
    nodes: DrawNode[],
    edges: DrawEdge[]
  ): Promise<{ nodesCsv: string; edgesCsv: string }> {
    // 节点 CSV
    let nodesCsv = 'ID,名称,描述,类型,X,Y,宽,高,颜色,边框颜色\n'
    nodes.forEach(node => {
      const desc = (node.description || '').replace(/"/g, '""')
      nodesCsv += `"${node.id}","${node.label}","${desc}","${node.type}",${node.x},${node.y},${node.width},${node.height},"${node.color}","${node.borderColor}"\n`
    })

    // 连接 CSV
    let edgesCsv = '源节点ID,目标节点ID,标签,类型,颜色,线宽\n'
    edges.forEach(edge => {
      edgesCsv += `"${edge.fromNodeId}","${edge.toNodeId}","${edge.label || ''}","${edge.type}","${edge.color}",${edge.lineWidth}\n`
    })

    return { nodesCsv, edgesCsv }
  }

  /**
   * 从 CSV 导入节点
   */
  static async importNodesFromCSV(csvString: string): Promise<DrawNode[]> {
    const lines = csvString.trim().split('\n')
    const nodes: DrawNode[] = []

    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = this.parseCSVLine(line)

      if (values.length >= 10) {
        nodes.push({
          id: values[0],
          label: values[1],
          description: values[2],
          type: values[3] as any,
          x: parseFloat(values[4]),
          y: parseFloat(values[5]),
          width: parseFloat(values[6]),
          height: parseFloat(values[7]),
          color: values[8],
          borderColor: values[9]
        })
      }
    }

    return nodes
  }

  /**
   * 解析 CSV 行
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }

    result.push(current)
    return result.map(v => v.replace(/^"|"$/g, ''))
  }

  /**
   * 生成下载链接
   */
  static createDownloadLink(content: string, _filename: string, mimeType: string = 'text/plain'): string {
    const blob = new Blob([content], { type: mimeType })
    return URL.createObjectURL(blob)
  }

  /**
   * 下载文件
   */
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const link = document.createElement('a')
    link.href = this.createDownloadLink(content, filename, mimeType)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  /**
   * 转换为 PlantUML 格式
   */
  static generatePlantUML(nodes: DrawNode[], edges: DrawEdge[]): string {
    let puml = '@startuml\n'
    puml += 'skinparam backgroundColor #FEFEFE\n'

    // 添加节点
    nodes.forEach(node => {
      if (node.type === 'group') {
        puml += `package "${node.label}" {\n}\n`
      } else {
        puml += `node "${node.label}" as ${node.id}\n`
      }
    })

    // 添加连接
    edges.forEach(edge => {
      puml += `${edge.fromNodeId} --> ${edge.toNodeId}\n`
    })

    puml += '@enduml\n'
    return puml
  }

  /**
   * 转换为 GraphViz DOT 格式
   */
  static generateGraphVizDOT(nodes: DrawNode[], edges: DrawEdge[], directed: boolean = true): string {
    const graphType = directed ? 'digraph' : 'graph'
    const edgeOp = directed ? '->' : '--'
    let dot = `${graphType} G {\n`
    dot += '  rankdir=LR;\n'
    dot += '  node [shape=box, style=rounded];\n'

    // 添加节点
    nodes.forEach(node => {
      const label = node.label.replace(/"/g, '\\"')
      dot += `  "${node.id}" [label="${label}"];\n`
    })

    // 添加连接
    edges.forEach(edge => {
      if (edge.label) {
        dot += `  "${edge.fromNodeId}" ${edgeOp} "${edge.toNodeId}" [label="${edge.label}"];\n`
      } else {
        dot += `  "${edge.fromNodeId}" ${edgeOp} "${edge.toNodeId}";\n`
      }
    })

    dot += '}\n'
    return dot
  }
}

/**
 * 辅助函数：获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * 辅助函数：验证文件类型
 */
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = getFileExtension(filename)
  return allowedTypes.includes(ext)
}

/**
 * 辅助函数：生成时间戳文件名
 */
export function generateTimestampFilename(prefix: string = 'export', ext: string = 'json'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${prefix}_${timestamp}.${ext}`
}

export default DrawExportService

