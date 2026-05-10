package services

import (
	"testing"

	"Qingyu-Editor/database"
)

func TestChapterServiceReorderRootChapters(t *testing.T) {
	svcs := newTestServices(t)
	project := createTestProject(t, svcs.project, "重排项目")

	chapterA := createTestChapter(t, svcs.chapter, project.ID, nil, "第一章", 0)
	chapterB := createTestChapter(t, svcs.chapter, project.ID, nil, "第二章", 1)
	chapterC := createTestChapter(t, svcs.chapter, project.ID, nil, "第三章", 2)

	err := svcs.chapter.Reorder(database.ReorderChaptersInput{
		ProjectID:  project.ID,
		OrderedIDs: []string{chapterC.ID, chapterA.ID, chapterB.ID},
	})
	if err != nil {
		t.Fatalf("重排章节失败: %v", err)
	}

	chapters, err := svcs.chapter.List(project.ID)
	if err != nil {
		t.Fatalf("读取章节列表失败: %v", err)
	}

	if len(chapters) != 3 {
		t.Fatalf("期望 3 个章节，实际 %d", len(chapters))
	}

	expected := []string{chapterC.ID, chapterA.ID, chapterB.ID}
	for index, chapter := range chapters {
		if chapter.ID != expected[index] {
			t.Fatalf("章节顺序错误: index=%d got=%s want=%s", index, chapter.ID, expected[index])
		}
		if chapter.SortOrder != index {
			t.Fatalf("章节 sortOrder 未重写: id=%s got=%d want=%d", chapter.ID, chapter.SortOrder, index)
		}
	}
}

func TestChapterServiceMoveAcrossVolumesRewritesScopeOrder(t *testing.T) {
	svcs := newTestServices(t)
	project := createTestProject(t, svcs.project, "移动项目")
	volumeA := createTestVolume(t, svcs.volume, project.ID, "第一卷", 0)
	volumeB := createTestVolume(t, svcs.volume, project.ID, "第二卷", 1)

	chapterA1 := createTestChapter(t, svcs.chapter, project.ID, &volumeA.ID, "A1", 0)
	chapterA2 := createTestChapter(t, svcs.chapter, project.ID, &volumeA.ID, "A2", 1)
	chapterB1 := createTestChapter(t, svcs.chapter, project.ID, &volumeB.ID, "B1", 0)

	err := svcs.chapter.Move(database.MoveChapterInput{
		ChapterID:      chapterA2.ID,
		TargetVolumeID: &volumeB.ID,
		TargetIndex:    0,
	})
	if err != nil {
		t.Fatalf("跨卷移动章节失败: %v", err)
	}

	chapters, err := svcs.chapter.List(project.ID)
	if err != nil {
		t.Fatalf("读取章节列表失败: %v", err)
	}

	var volumeAChapters []string
	var volumeBChapters []string
	for _, chapter := range chapters {
		switch chapter.VolumeID {
		case volumeA.ID:
			volumeAChapters = append(volumeAChapters, chapter.ID)
			if chapter.ID == chapterA1.ID && chapter.SortOrder != 0 {
				t.Fatalf("原卷章节排序未收敛: got=%d want=0", chapter.SortOrder)
			}
		case volumeB.ID:
			volumeBChapters = append(volumeBChapters, chapter.ID)
			if chapter.ID == chapterA2.ID && chapter.SortOrder != 0 {
				t.Fatalf("目标卷插入章节排序错误: got=%d want=0", chapter.SortOrder)
			}
			if chapter.ID == chapterB1.ID && chapter.SortOrder != 1 {
				t.Fatalf("目标卷原章节排序未后移: got=%d want=1", chapter.SortOrder)
			}
		}
	}

	if len(volumeAChapters) != 1 || volumeAChapters[0] != chapterA1.ID {
		t.Fatalf("原卷章节集合错误: %+v", volumeAChapters)
	}

	if len(volumeBChapters) != 2 || volumeBChapters[0] != chapterA2.ID || volumeBChapters[1] != chapterB1.ID {
		t.Fatalf("目标卷章节顺序错误: %+v", volumeBChapters)
	}
}
