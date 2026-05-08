import httpService from '@/core/services/http.service'
import type {
  Character,
  CharacterRelation,
  CharacterGraph,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  SaveRelationRequest,
} from '../types/character'

// 基础路径定义 (用于复用)
const BASE_PROJECT_URL = '/writer/projects'
const BASE_CHAR_URL = '/characters'

export const characterApi = {
  // ==========================================
  // 角色管理 (Character CRUD)
  // ==========================================

  /**
   * 创建角色
   * @description 在指定项目中创建新角色
   * @endpoint POST /api/v1/projects/:projectId/characters
   * @category writer
   * @tags 角色管理
   * @param {string} projectId - 项目ID
   * @param {CreateCharacterRequest} data - 角色创建数据
   * @response {Character} 201 - 成功返回创建的角色信息
   * @security BearerAuth
   */
  create(projectId: string, data: CreateCharacterRequest) {
    return httpService.post<Character>(`${BASE_PROJECT_URL}/${projectId}/characters`, data)
  },

  /**
   * 获取角色详情
   * @description 获取指定角色的详细信息
   * @endpoint GET /api/v1/characters/:characterId
   * @category writer
   * @tags 角色管理
   * @param {string} characterId - 角色ID
   * @param {string} projectId - 项目ID（作为查询参数）
   * @response {Character} 200 - 成功返回角色详情
   * @security BearerAuth
   */
  getDetail(characterId: string, projectId: string) {
    return httpService.get<Character>(
      `${BASE_CHAR_URL}/${characterId}`,
      { params: { projectId } } as any
    )
  },

  /**
   * 获取项目角色列表
   * @description 获取指定项目的所有角色列表
   * @endpoint GET /api/v1/projects/:projectId/characters
   * @category writer
   * @tags 角色管理
   * @param {string} projectId - 项目ID
   * @response {Character[]} 200 - 成功返回角色列表
   * @security BearerAuth
   */
  list(projectId: string) {
    return httpService.get<Character[]>(`${BASE_PROJECT_URL}/${projectId}/characters`)
  },

  /**
   * 更新角色
   * @description 更新指定角色的信息
   * @endpoint PUT /api/v1/characters/:characterId
   * @category writer
   * @tags 角色管理
   * @param {string} characterId - 角色ID
   * @param {string} projectId - 项目ID（作为查询参数）
   * @param {UpdateCharacterRequest} data - 角色更新数据
   * @response {Character} 200 - 成功返回更新后的角色信息
   * @security BearerAuth
   */
  update(characterId: string, projectId: string, data: UpdateCharacterRequest) {
    return httpService.put<Character>(
      `${BASE_CHAR_URL}/${characterId}`,
      data,
      { params: { projectId } } // PUT 请求中，params 需要放在 config 对象里
    )
  },

  /**
   * 删除角色
   * @description 删除指定角色
   * @endpoint DELETE /api/v1/characters/:characterId
   * @category writer
   * @tags 角色管理
   * @param {string} characterId - 角色ID
   * @param {string} projectId - 项目ID（作为查询参数）
   * @response {void} 204 - 成功删除角色
   * @security BearerAuth
   */
  delete(characterId: string, projectId: string) {
    return httpService.delete<void>(
      `${BASE_CHAR_URL}/${characterId}`,
      { params: { projectId } } as any
    )
  },

  // ==========================================
  // 关系管理 (Relation Management)
  // ==========================================

  /**
   * 创建角色关系
   * @description 为指定项目的角色创建关系
   * @endpoint POST /api/v1/characters/relations
   * @category writer
   * @tags 角色管理
   * @param {string} projectId - 项目ID（作为查询参数）
   * @param {SaveRelationRequest} data - 关系创建数据
   * @response {CharacterRelation} 201 - 成功返回创建的关系信息
   * @security BearerAuth
   */
  createRelation(projectId: string, data: SaveRelationRequest) {
    return httpService.post<CharacterRelation>(
      `${BASE_CHAR_URL}/relations`,
      data,
      { params: { projectId } } // projectId 是 query 参数
    )
  },

  /**
   * 获取角色关系列表
   * @description 获取指定项目的角色关系列表，可筛选特定角色的关系
   * @endpoint GET /api/v1/projects/:projectId/characters/relations
   * @category writer
   * @tags 角色管理
   * @param {string} projectId - 项目ID
   * @param {string} [characterId] - 角色ID（可选，用于筛选特定角色的关系）
   * @response {CharacterRelation[]} 200 - 成功返回角色关系列表
   * @security BearerAuth
   */
  listRelations(projectId: string, characterId?: string) {
    const params: any = {}
    if (characterId) params.characterId = characterId

    return httpService.get<CharacterRelation[]>(
      `${BASE_PROJECT_URL}/${projectId}/characters/relations`,
      params
    )
  },

  /**
   * 删除角色关系
   * @description 删除指定的角色关系
   * @endpoint DELETE /api/v1/characters/relations/:relationId
   * @category writer
   * @tags 角色管理
   * @param {string} relationId - 关系ID
   * @param {string} projectId - 项目ID（作为查询参数）
   * @response {void} 204 - 成功删除角色关系
   * @security BearerAuth
   */
  deleteRelation(relationId: string, projectId: string) {
    return httpService.delete<void>(`${BASE_CHAR_URL}/relations/${relationId}`, { params: { projectId } } as any)
  },

  /**
   * 获取角色关系图谱
   * @description 获取指定项目的角色关系图谱数据，用于可视化展示角色关系网络
   * @endpoint GET /api/v1/projects/:projectId/characters/graph
   * @category writer
   * @tags 角色管理
   * @param {string} projectId - 项目ID
   * @response {CharacterGraph} 200 - 成功返回角色关系图谱数据
   * @security BearerAuth
   */
  getGraph(projectId: string) {
    return httpService.get<CharacterGraph>(`${BASE_PROJECT_URL}/${projectId}/characters/graph`)
  },
}

// 便捷函数导出（兼容旧代码）

/**
 * 获取项目角色列表（便捷函数）
 * @description 获取指定项目的所有角色列表
 * @endpoint GET /api/v1/projects/:projectId/characters
 * @category writer
 * @tags 角色管理
 * @param {string} projectId - 项目ID
 * @response {Character[]} 200 - 成功返回角色列表
 * @security BearerAuth
 */
export const listCharacters = (projectId: string) => characterApi.list(projectId)

/**
 * 获取角色关系列表（便捷函数）
 * @description 获取指定项目的角色关系列表，可筛选特定角色的关系
 * @endpoint GET /api/v1/projects/:projectId/characters/relations
 * @category writer
 * @tags 角色管理
 * @param {string} projectId - 项目ID
 * @param {string} [characterId] - 角色ID（可选，用于筛选特定角色的关系）
 * @response {CharacterRelation[]} 200 - 成功返回角色关系列表
 * @security BearerAuth
 */
export const listCharacterRelations = (projectId: string, characterId?: string) => characterApi.listRelations(projectId, characterId)

/**
 * 创建角色（便捷函数）
 * @description 在指定项目中创建新角色
 * @endpoint POST /api/v1/projects/:projectId/characters
 * @category writer
 * @tags 角色管理
 * @param {string} projectId - 项目ID
 * @param {CreateCharacterRequest} data - 角色创建数据
 * @response {Character} 201 - 成功返回创建的角色信息
 * @security BearerAuth
 */
export const createCharacter = (projectId: string, data: CreateCharacterRequest) => characterApi.create(projectId, data)

/**
 * 更新角色（便捷函数）
 * @description 更新指定角色的信息
 * @endpoint PUT /api/v1/characters/:characterId
 * @category writer
 * @tags 角色管理
 * @param {string} characterId - 角色ID
 * @param {string} projectId - 项目ID（作为查询参数）
 * @param {UpdateCharacterRequest} data - 角色更新数据
 * @response {Character} 200 - 成功返回更新后的角色信息
 * @security BearerAuth
 */
export const updateCharacter = (characterId: string, projectId: string, data: UpdateCharacterRequest) => characterApi.update(characterId, projectId, data)

/**
 * 删除角色（便捷函数）
 * @description 删除指定角色
 * @endpoint DELETE /api/v1/characters/:characterId
 * @category writer
 * @tags 角色管理
 * @param {string} characterId - 角色ID
 * @param {string} projectId - 项目ID（作为查询参数）
 * @response {void} 204 - 成功删除角色
 * @security BearerAuth
 */
export const deleteCharacter = (characterId: string, projectId: string) => characterApi.delete(characterId, projectId)
