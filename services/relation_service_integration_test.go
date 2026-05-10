package services

import (
	"testing"

	"Qingyu-Editor/database"
)

func TestCharacterServiceListRelationsFiltersByCharacter(t *testing.T) {
	svcs := newTestServices(t)
	project := createTestProject(t, svcs.project, "角色关系项目")
	characterA := createTestCharacter(t, svcs.character, project.ID, "甲")
	characterB := createTestCharacter(t, svcs.character, project.ID, "乙")
	characterC := createTestCharacter(t, svcs.character, project.ID, "丙")

	relationAB, err := svcs.character.CreateRelation(database.CreateCharacterRelationInput{
		ProjectID: project.ID,
		FromID:    characterA.ID,
		ToID:      characterB.ID,
		Type:      "朋友",
	})
	if err != nil {
		t.Fatalf("创建角色关系 AB 失败: %v", err)
	}
	_, err = svcs.character.CreateRelation(database.CreateCharacterRelationInput{
		ProjectID: project.ID,
		FromID:    characterB.ID,
		ToID:      characterC.ID,
		Type:      "对手",
	})
	if err != nil {
		t.Fatalf("创建角色关系 BC 失败: %v", err)
	}

	filtered, err := svcs.character.ListRelations(project.ID, characterA.ID)
	if err != nil {
		t.Fatalf("按角色筛选关系失败: %v", err)
	}
	if len(filtered) != 1 || filtered[0].ID != relationAB.ID {
		t.Fatalf("角色关系筛选结果错误: %+v", filtered)
	}

	allRelations, err := svcs.character.ListRelations(project.ID, "")
	if err != nil {
		t.Fatalf("读取全部角色关系失败: %v", err)
	}
	if len(allRelations) != 2 {
		t.Fatalf("期望 2 条角色关系，实际 %d", len(allRelations))
	}
}

func TestLocationServiceListRelationsFiltersByLocation(t *testing.T) {
	svcs := newTestServices(t)
	project := createTestProject(t, svcs.project, "地点关系项目")
	locationA := createTestLocation(t, svcs.location, project.ID, "城镇")
	locationB := createTestLocation(t, svcs.location, project.ID, "森林")
	locationC := createTestLocation(t, svcs.location, project.ID, "港口")

	relationAB, err := svcs.location.CreateRelation(database.CreateLocationRelationInput{
		ProjectID: project.ID,
		FromID:    locationA.ID,
		ToID:      locationB.ID,
		Type:      "邻接",
	})
	if err != nil {
		t.Fatalf("创建地点关系 AB 失败: %v", err)
	}
	_, err = svcs.location.CreateRelation(database.CreateLocationRelationInput{
		ProjectID: project.ID,
		FromID:    locationB.ID,
		ToID:      locationC.ID,
		Type:      "远距",
	})
	if err != nil {
		t.Fatalf("创建地点关系 BC 失败: %v", err)
	}

	filtered, err := svcs.location.ListRelations(project.ID, locationA.ID)
	if err != nil {
		t.Fatalf("按地点筛选关系失败: %v", err)
	}
	if len(filtered) != 1 || filtered[0].ID != relationAB.ID {
		t.Fatalf("地点关系筛选结果错误: %+v", filtered)
	}

	allRelations, err := svcs.location.ListRelations(project.ID, "")
	if err != nil {
		t.Fatalf("读取全部地点关系失败: %v", err)
	}
	if len(allRelations) != 2 {
		t.Fatalf("期望 2 条地点关系，实际 %d", len(allRelations))
	}
}
