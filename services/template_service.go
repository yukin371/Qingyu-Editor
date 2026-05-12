package services

import (
	"errors"

	"Qingyu-Editor/database"
)

type TemplateService struct{}

func NewTemplateService() *TemplateService {
	return &TemplateService{}
}

func (s *TemplateService) List() []database.CreativeWorkflowTemplate {
	return cloneCreativeWorkflowTemplates(creativeWorkflowTemplates)
}

func (s *TemplateService) Get(templateID string) (database.CreativeWorkflowTemplate, error) {
	template, ok := getCreativeWorkflowTemplateDefinition(templateID)
	if !ok {
		return database.CreativeWorkflowTemplate{}, errors.New("模板不存在")
	}
	return cloneCreativeWorkflowTemplate(template), nil
}

func getCreativeWorkflowTemplateDefinition(
	templateID string,
) (database.CreativeWorkflowTemplate, bool) {
	for _, template := range creativeWorkflowTemplates {
		if template.ID == templateID {
			return template, true
		}
	}
	return database.CreativeWorkflowTemplate{}, false
}

func cloneCreativeWorkflowTemplates(
	items []database.CreativeWorkflowTemplate,
) []database.CreativeWorkflowTemplate {
	cloned := make([]database.CreativeWorkflowTemplate, 0, len(items))
	for _, item := range items {
		cloned = append(cloned, cloneCreativeWorkflowTemplate(item))
	}
	return cloned
}

func cloneCreativeWorkflowTemplate(
	item database.CreativeWorkflowTemplate,
) database.CreativeWorkflowTemplate {
	return database.CreativeWorkflowTemplate{
		ID:                  item.ID,
		Name:                item.Name,
		Tagline:             item.Tagline,
		Category:            item.Category,
		TemplateType:        item.TemplateType,
		RecommendedLabel:    item.RecommendedLabel,
		ApplicableTo:        append([]string{}, item.ApplicableTo...),
		EmotionCurve:        item.EmotionCurve,
		PayoffFocus:         append([]string{}, item.PayoffFocus...),
		DefaultAudience:     append([]string{}, item.DefaultAudience...),
		DefaultPromises:     append([]string{}, item.DefaultPromises...),
		DefaultPaceContract: item.DefaultPaceContract,
		BlueprintHints:      append([]string{}, item.BlueprintHints...),
		GoldenChapterSeeds:  cloneGoldenChapterPlans(item.GoldenChapterSeeds),
		Characters:          cloneTemplateDetailSections(item.Characters),
		Settings:            cloneTemplateDetailSections(item.Settings),
		ProjectCategory:     item.ProjectCategory,
		VolumeTitle:         item.VolumeTitle,
		OpeningLine:         item.OpeningLine,
	}
}

func cloneTemplateDetailSections(
	items []database.TemplateDetailSection,
) []database.TemplateDetailSection {
	cloned := make([]database.TemplateDetailSection, 0, len(items))
	for _, item := range items {
		cloned = append(cloned, database.TemplateDetailSection{
			ID:      item.ID,
			Title:   item.Title,
			Summary: item.Summary,
			Bullets: append([]string{}, item.Bullets...),
		})
	}
	return cloned
}

func cloneGoldenChapterPlans(
	items []database.GoldenChapterPlan,
) []database.GoldenChapterPlan {
	cloned := make([]database.GoldenChapterPlan, 0, len(items))
	for _, item := range items {
		cloned = append(cloned, database.GoldenChapterPlan{
			ChapterNumber: item.ChapterNumber,
			Title:         item.Title,
			Summary:       item.Summary,
			Hook:          item.Hook,
			Payoff:        item.Payoff,
		})
	}
	return cloned
}

var creativeWorkflowTemplates = []database.CreativeWorkflowTemplate{
	{
		ID:                  "comeback",
		Name:                "逆袭打脸",
		Tagline:             "先压抑，再转折，第三章必须先兑现一次。",
		Category:            "爽感反击",
		TemplateType:        "整套开局模板",
		RecommendedLabel:    "适合前三章强兑现",
		ApplicableTo:        []string{"赘婿", "战神", "神医", "神豪", "鉴宝逆袭"},
		EmotionCurve:        "压抑 → 转折 → 爆发",
		PayoffFocus:         []string{"身份反转", "实力碾压", "财富碾压"},
		DefaultAudience:     []string{"喜欢高压反转", "期待明确爽点兑现"},
		DefaultPromises:     []string{"主角不会一直吃瘪", "前三章必须建立反击节奏"},
		DefaultPaceContract: "前 3000 字完成羞辱建压，第三章必须出现首次打脸兑现。",
		BlueprintHints:      []string{"尽快立反派嘴脸", "第三章后埋更大阶层冲突", "兑现后保留下一轮更高目标"},
		GoldenChapterSeeds: []database.GoldenChapterPlan{
			{ChapterNumber: 1, Title: "屈辱现场", Summary: "先建立主角被轻视、被误判或被压制的局面。", Hook: "让读者看到主角明明有底牌，却暂时无法出手的理由。", Payoff: "埋下身份/能力反转信号，但不提前完全揭牌。"},
			{ChapterNumber: 2, Title: "身份初显", Summary: "让主角的真实身份、资源或能力第一次被少数人看见。", Hook: "制造旁观者与反派的信息差，拉高期待。", Payoff: "给出明确转折，让读者相信反击已经开始。"},
			{ChapterNumber: 3, Title: "首次打脸", Summary: "在小范围内完成一次直接兑现，让压制关系翻面。", Hook: "兑现后留下更高层级敌人或更大误会。", Payoff: "完成第一次爽点交付，同时抬升后续战场。"},
		},
		Characters: []database.TemplateDetailSection{
			{ID: "hero", Title: "被低估的主角", Summary: "开局先让读者看到主角暂时被压制，但真正底牌不能立刻打完。", Bullets: []string{"有明确被误判场景", "第一次亮牌只露一角", "第三章前完成一次正面反击"}},
			{ID: "rival", Title: "高压反派", Summary: "反派要在前两章持续制造羞辱感，确保第三章反击足够痛快。", Bullets: []string{"嘴脸清晰", "权势或资源压制明显", "第一次败退后仍能抬升更大冲突"}},
		},
		Settings: []database.TemplateDetailSection{
			{ID: "stakes", Title: "压制场与反转场", Summary: "把开局空间拆成“受辱现场”“少数人见证反转”“小范围兑现”三段。", Bullets: []string{"场景层级逐步抬升", "信息差服务反转", "兑现后留下更高战场"}},
		},
		ProjectCategory: "赘婿",
		VolumeTitle:     "逆袭开局骨架",
		OpeningLine:     "先压抑，再反击，把第一次打脸做成作者与读者的共同呼吸点。",
	},
	{
		ID:                  "power-up",
		Name:                "升级碾压",
		Tagline:             "先见困境，再给金手指，第三章必须见第一次碾压。",
		Category:            "升级成长",
		TemplateType:        "成长型开局模板",
		RecommendedLabel:    "适合系统 / 玄幻 / 异界",
		ApplicableTo:        []string{"玄幻", "仙侠", "系统文", "游戏异界", "凡人流"},
		EmotionCurve:        "认知设定 → 获得优势 → 碾压不公",
		PayoffFocus:         []string{"实力展示", "跨级突破", "世界观扩张"},
		DefaultAudience:     []string{"喜欢成长曲线", "接受设定驱动推进"},
		DefaultPromises:     []string{"成长有因果", "前三章必须看到金手指生效"},
		DefaultPaceContract: "第一章建立困境和规则，第二章给能力入口，第三章完成首次跨级压制。",
		BlueprintHints:      []string{"先立世界规则再破局", "金手指代价要写清", "第一次胜利同时打开更大地图"},
		GoldenChapterSeeds: []database.GoldenChapterPlan{
			{ChapterNumber: 1, Title: "困境闪光", Summary: "在既有规则下让主角显出不同常人的一点火花。", Hook: "提示主角具备被世界低估的潜力或特殊感知。", Payoff: "让读者先相信主角值得投资，而不是空降天命。"},
			{ChapterNumber: 2, Title: "金手指就位", Summary: "明确触发条件与代价，让外挂不显得凭空降临。", Hook: "把能力和当前危机绑在一起，逼主角立刻使用。", Payoff: "完成从“可能逆袭”到“已经拥有工具”的转折。"},
			{ChapterNumber: 3, Title: "第一次碾压", Summary: "安排一次短平快的压制，让优势被外部世界承认。", Hook: "胜利后顺手揭示更高一层目标或敌人。", Payoff: "兑现升级型作品的第一针强刺激。"},
		},
		Characters: []database.TemplateDetailSection{
			{ID: "hero", Title: "潜力主角", Summary: "主角开局先被规则束缚，但要让读者提前看见潜力差。", Bullets: []string{"困境真实", "优势有代价", "第三章起世界对主角产生新认知"}},
			{ID: "mentor", Title: "规则见证者", Summary: "可以是导师、系统、宿敌，用来解释规则与抬高突破门槛。", Bullets: []string{"帮助读者读懂世界", "推动主角试错", "见证首次突破"}},
		},
		Settings: []database.TemplateDetailSection{
			{ID: "rules", Title: "世界规则与外挂代价", Summary: "世界观先立后破，金手指必须绑定清晰成本。", Bullets: []string{"第一章立规矩", "第二章给钥匙", "第三章打穿一层不公"}},
		},
		ProjectCategory: "玄幻",
		VolumeTitle:     "成长起步骨架",
		OpeningLine:     "先交代规则，再让优势生效，第一次碾压必须成为世界承认主角的节点。",
	},
	{
		ID:                  "mystery",
		Name:                "求知解谜",
		Tagline:             "异常先出现，规则尽早亮，第三章要看到第一次破局。",
		Category:            "规则悬疑",
		TemplateType:        "解谜型开局模板",
		RecommendedLabel:    "适合悬疑 / 规则怪谈",
		ApplicableTo:        []string{"悬疑", "无限流", "规则怪谈", "灵异", "盗墓"},
		EmotionCurve:        "困惑好奇 → 获取线索 → 初见真相曙光",
		PayoffFocus:         []string{"智力破局", "规则揭示", "谜团推进"},
		DefaultAudience:     []string{"喜欢规则推演", "在意信息伏笔回收"},
		DefaultPromises:     []string{"线索可复盘", "前三章必须给出第一次有效解"},
		DefaultPaceContract: "开篇 2000 字内亮异常和规则代价，第三章结尾必须完成首轮破局。",
		BlueprintHints:      []string{"规则不要一次说完", "每章至少有一条新线索", "破局要基于前文已给信息"},
		GoldenChapterSeeds: []database.GoldenChapterPlan{
			{ChapterNumber: 1, Title: "踏入异常", Summary: "主角进入失常空间、诡异规则或谜团现场。", Hook: "异常必须具体可感，让读者立刻意识到危险并想知道规则。", Payoff: "建立第一层规则或禁忌，但不要解释全部真相。"},
			{ChapterNumber: 2, Title: "危险试错", Summary: "让主角或他人触发错误选项，换来惩罚和更关键的线索。", Hook: "用损失换信息，让规则的代价真实存在。", Payoff: "读者获得可以一起推理的关键信息。"},
			{ChapterNumber: 3, Title: "第一次破局", Summary: "主角利用前文线索完成首轮小范围破局。", Hook: "破局后立刻暴露更大的谜团或更危险的下一层。", Payoff: "兑现智力型爽点，建立读者对作者控局能力的信任。"},
		},
		Characters: []database.TemplateDetailSection{
			{ID: "solver", Title: "破局视角者", Summary: "负责把异常感、试错成本和推理过程串起来。", Bullets: []string{"注意力敏锐", "会被规则惩罚", "第一次破局依赖前文线索"}},
			{ID: "foil", Title: "试错代价承受者", Summary: "通过旁人误判或牺牲，让规则的风险变成可感知事实。", Bullets: []string{"信息不对称", "错误选择带来损失", "反衬主角的推理价值"}},
		},
		Settings: []database.TemplateDetailSection{
			{ID: "rules", Title: "异常空间与禁忌", Summary: "规则必须具体，且至少能给出一轮可验证的真伪反馈。", Bullets: []string{"异常可视化", "线索能复盘", "破局后抛出更大谜团"}},
		},
		ProjectCategory: "悬疑",
		VolumeTitle:     "异常引线骨架",
		OpeningLine:     "异常和规则代价要尽早出现，第一次破局必须可回溯。",
	},
	{
		ID:                  "building",
		Name:                "建设养成",
		Tagline:             "先看烂摊子，再给资源杠杆，第三章要看到第一份成果。",
		Category:            "建设经营",
		TemplateType:        "经营型开局模板",
		RecommendedLabel:    "适合种田 / 领主 / 家族",
		ApplicableTo:        []string{"种田", "基建", "领主", "家族", "经营"},
		EmotionCurve:        "看到困局 → 获得工具 → 初见建设成果",
		PayoffFocus:         []string{"资源获取", "建设成果", "正向循环"},
		DefaultAudience:     []string{"喜欢经营闭环", "接受慢热但要持续增益"},
		DefaultPromises:     []string{"资源增长看得见", "前三章必须出现第一轮建设回报"},
		DefaultPaceContract: "第一章明确资源缺口，第二章引入核心工具或资源，第三章交付第一份建设成果。",
		BlueprintHints:      []string{"把困局量化", "核心资源链尽早成形", "成果要引出下一轮扩张空间"},
		GoldenChapterSeeds: []database.GoldenChapterPlan{
			{ChapterNumber: 1, Title: "绝境领地", Summary: "交代主角接手的是怎样一个具体烂摊子。", Hook: "用资源清单、民心或地理困境快速建立压力。", Payoff: "让读者清楚后续建设成功到底会有多爽。"},
			{ChapterNumber: 2, Title: "核心优势出现", Summary: "给出系统、技术、人才或资源入口，明确可持续优势。", Hook: "优势必须马上能投入当前困局，而不是空悬设定。", Payoff: "完成“无计可施”到“有办法试一次”的转折。"},
			{ChapterNumber: 3, Title: "第一份成果", Summary: "交付第一轮建设回报，让角色和环境产生肉眼可见变化。", Hook: "成果后立刻出现更大的扩建需求或竞争者。", Payoff: "兑现经营养成的第一轮正反馈。"},
		},
		Characters: []database.TemplateDetailSection{
			{ID: "builder", Title: "经营者主角", Summary: "要清楚知道自己接手的是怎样的资源黑洞，以及准备如何撬动第一轮杠杆。", Bullets: []string{"困境可量化", "资源链看得见", "成果会带来下一轮扩张目标"}},
			{ID: "ally", Title: "关键资源位", Summary: "可以是人才、系统或关键地缘资源，用来让建设成果提前落地。", Bullets: []string{"不是万能外挂", "必须立刻接入当前困局", "推动正反馈形成"}},
		},
		Settings: []database.TemplateDetailSection{
			{ID: "territory", Title: "资源盘点与扩张线", Summary: "把烂摊子、资源入口和第一轮建设回报拆成连续推进的清单。", Bullets: []string{"压力来自现实缺口", "资源入口及时落地", "第一份成果触发更大需求"}},
		},
		ProjectCategory: "种田",
		VolumeTitle:     "建设起盘骨架",
		OpeningLine:     "先把烂摊子量化，再让第一轮建设成果可被角色和环境共同看见。",
	},
	{
		ID:                  "emotion",
		Name:                "情感共鸣",
		Tagline:             "先让人心疼，再让关系介入，第三章要看到第一次改变。",
		Category:            "情感羁绊",
		TemplateType:        "关系型开局模板",
		RecommendedLabel:    "适合言情 / 救赎 / 群像",
		ApplicableTo:        []string{"言情", "救赎", "群像羁绊", "电竞群像", "兄弟情"},
		EmotionCurve:        "孤独/遗憾 → 特殊的人出现 → 因对方看见新可能",
		PayoffFocus:         []string{"关系推进", "情感共鸣", "人格魅力"},
		DefaultAudience:     []string{"重视角色关系", "在意情绪起伏和互动张力"},
		DefaultPromises:     []string{"角色关系持续升温", "前三章必须让关系线有一次实质推进"},
		DefaultPaceContract: "第一章建立孤独/遗憾，第二章让关键关系闯入，第三章给出因关系而发生的第一次改变。",
		BlueprintHints:      []string{"冲突源头要情绪化而非纯信息", "关系推进要有双向作用", "每次靠近都伴随新的风险"},
		GoldenChapterSeeds: []database.GoldenChapterPlan{
			{ChapterNumber: 1, Title: "展示孤独", Summary: "让主角的遗憾、创伤或现实困境先被读者看见。", Hook: "用一个能刺痛人的具体场景建立情绪共感。", Payoff: "不急着解决问题，先让读者愿意陪主角走下去。"},
			{ChapterNumber: 2, Title: "闯入者登场", Summary: "让能改变主角状态的人闯进来，打乱原本节奏。", Hook: "关系对象的出现必须带着强烈辨识度和新问题。", Payoff: "建立情感线的吸引力和冲突源。"},
			{ChapterNumber: 3, Title: "第一次改变", Summary: "主角因为对方做出一个以前不会做的选择。", Hook: "改变后立刻暴露关系代价，避免甜得太轻。", Payoff: "兑现关系推进，让读者感知人物真的动了。"},
		},
		Characters: []database.TemplateDetailSection{
			{ID: "lead", Title: "带伤主角", Summary: "主角需要先暴露孤独、遗憾或创伤，让关系推进有明确情绪支点。", Bullets: []string{"痛点具体", "不急着自愈", "变化必须因关系触发"}},
			{ID: "anchor", Title: "关系锚点", Summary: "这个人物要带来辨识度、冲突和新的生存方式，而不只是安慰。", Bullets: []string{"登场有侵入性", "推进是双向的", "靠近伴随风险"}},
		},
		Settings: []database.TemplateDetailSection{
			{ID: "emotion", Title: "情绪场与关系代价", Summary: "每次靠近都要改变角色选择，并带出新的心理或现实成本。", Bullets: []string{"第一章建立共感", "第二章闯入关系对象", "第三章让主角做出不同选择"}},
		},
		ProjectCategory: "言情",
		VolumeTitle:     "关系升温骨架",
		OpeningLine:     "先让读者心疼，再让关键关系介入，第三章必须看到一次实质改变。",
	},
}
