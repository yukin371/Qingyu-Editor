package storage

// ExportFormat 支持的导出格式
type ExportFormat string

const (
	FormatMarkdown ExportFormat = "md"
	FormatDOCX    ExportFormat = "docx"
	FormatTXT     ExportFormat = "txt"
)

// Exporter 导出器接口
type Exporter interface {
	Export(projectID string, chapters []ChapterData, outputPath string) error
}

// ChapterData 章节导出数据
type ChapterData struct {
	Title     string
	Content   string // 纯文本内容
	WordCount int
}
