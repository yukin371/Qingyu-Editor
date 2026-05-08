import type { DocumentType } from './document'

export type WriterDocumentToolName =
  | 'list_documents'
  | 'read_document'
  | 'search_document'
  | 'patch_document'

export interface WriterDocumentToolEntry {
  documentId: string
  title: string
  type: DocumentType | string
  parentId?: string
  level: number
  order: number
  wordCount: number
  status?: string
}

export interface WriterDocumentLine {
  line: number
  text: string
}

export interface WriterListDocumentsToolRequest {
  projectId: string
}

export interface WriterListDocumentsToolResult {
  projectId: string
  documents: WriterDocumentToolEntry[]
}

export interface WriterReadDocumentToolRequest {
  documentId: string
}

export interface WriterReadDocumentToolResult {
  documentId: string
  version: number
  contentType: string
  totalLines: number
  lines: WriterDocumentLine[]
}

export interface WriterSearchDocumentToolRequest {
  documentId: string
  query: string
  caseSensitive?: boolean
  regex?: boolean
  contextLines?: number
}

export interface WriterDocumentSearchMatch {
  line: number
  startColumn: number
  endColumn: number
  text: string
  before: WriterDocumentLine[]
  after: WriterDocumentLine[]
}

export interface WriterSearchDocumentToolResult {
  documentId: string
  query: string
  totalMatches: number
  matches: WriterDocumentSearchMatch[]
}

export type WriterDocumentPatchOperation =
  | {
      type: 'replace_lines'
      startLine: number
      endLine: number
      lines: string[]
      expectedText?: string
    }
  | {
      type: 'delete_lines'
      startLine: number
      endLine: number
      expectedText?: string
    }
  | {
      type: 'insert_after_line'
      line: number
      lines: string[]
    }

export interface WriterDocumentPatchPreview {
  type: WriterDocumentPatchOperation['type']
  startLine: number
  endLine: number
  before: string[]
  after: string[]
}

export interface WriterPatchDocumentToolRequest {
  documentId: string
  version?: number
  operations: WriterDocumentPatchOperation[]
}

export interface WriterDocumentPatchPreviewResult {
  documentId: string
  baseVersion: number
  totalLines: number
  lines: WriterDocumentLine[]
  previews: WriterDocumentPatchPreview[]
}

export interface WriterPatchDocumentToolResult extends WriterDocumentPatchPreviewResult {
  documentId: string
  appliedVersion: number
  savedContentType: 'tiptap_json'
}

export type WriterDocumentToolRequest =
  | { tool: 'list_documents'; input: WriterListDocumentsToolRequest }
  | { tool: 'read_document'; input: WriterReadDocumentToolRequest }
  | { tool: 'search_document'; input: WriterSearchDocumentToolRequest }
  | { tool: 'patch_document'; input: WriterPatchDocumentToolRequest }

export type WriterDocumentToolResponse =
  | { tool: 'list_documents'; output: WriterListDocumentsToolResult }
  | { tool: 'read_document'; output: WriterReadDocumentToolResult }
  | { tool: 'search_document'; output: WriterSearchDocumentToolResult }
  | { tool: 'patch_document'; output: WriterPatchDocumentToolResult }
