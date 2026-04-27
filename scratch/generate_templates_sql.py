import json
import uuid

templates = [
    {
        "name": "Hero - 企业级即时通讯",
        "category": "Hero",
        "html": """
    <section class="relative bg-linear-to-b from-white to-gray-50 pt-16 pb-20 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">{{{ title }}}</h1>
          <p class="text-lg text-gray-600 mb-10">{{ description }}</p>
          <div class="flex flex-wrap gap-4 justify-center">
            <a href="{{ primaryBtnLink }}"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium shadow-md transition">{{ primaryBtnText }}</a>
            <a href="{{ secondaryBtnLink }}"
              class="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-full font-medium shadow-sm transition">{{ secondaryBtnText }}</a>
          </div>
        </div>
        <div class="mt-16 max-w-5xl mx-auto">
          <img
            src="{{ mainImage }}"
            alt="Hero Image" class="rounded-xl shadow-2xl border border-gray-200 w-full h-auto object-cover">
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "标题 (支持BR)", "default": "企业级即时通讯<br>让协作更快一步"},
                "description": {"type": "string", "title": "描述文字", "format": "textarea", "default": "安全、高效、可定制——专为现代企业打造的智能聊天平台，集成工作流与数据洞察。"},
                "primaryBtnText": {"type": "string", "title": "主按钮文字", "default": "开始免费使用"},
                "primaryBtnLink": {"type": "string", "title": "主按钮链接", "format": "uri", "default": "#"},
                "secondaryBtnText": {"type": "string", "title": "次按钮文字", "default": "联系销售"},
                "secondaryBtnLink": {"type": "string", "title": "次按钮链接", "format": "uri", "default": "#"},
                "mainImage": {"type": "string", "title": "主图地址", "format": "uri", "default": "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=60"}
            }
        }
    },
    {
        "name": "Feature - 左图右文",
        "category": "Features",
        "html": """
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="order-2 md:order-1">
            <img
              src="{{ image }}"
              alt="Feature Image" class="rounded-2xl shadow-lg border border-gray-200 w-full h-auto object-cover">
          </div>
          <div class="order-1 md:order-2">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ title }}</h2>
            <p class="text-gray-600 text-lg leading-relaxed">{{ description }}</p>
            <div class="mt-6 flex gap-4 text-sm text-indigo-600 font-medium">
              {{#each features}}
              <span class="flex items-center gap-1">✓ {{this}}</span>
              {{/each}}
            </div>
          </div>
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "标题", "default": "无缝沟通，跨越部门"},
                "description": {"type": "string", "title": "描述", "format": "textarea", "default": "打破信息孤岛，通过话题群组、私聊和富媒体分享，让每个人都能快速找到所需信息。集成企业目录，一键联系同事。"},
                "image": {"type": "string", "title": "图片地址", "format": "uri", "default": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=30"},
                "features": {
                    "type": "array",
                    "title": "特性标签",
                    "items": {"type": "string"},
                    "default": ["端到端加密", "无限历史记录"]
                }
            }
        }
    },
    {
        "name": "Feature - 左文右图",
        "category": "Features",
        "html": """
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ title }}</h2>
            <p class="text-gray-600 text-lg leading-relaxed">{{ description }}</p>
            <div class="mt-6 flex flex-wrap gap-3">
              {{#each tags}}
              <span class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">{{this}}</span>
              {{/each}}
            </div>
          </div>
          <div>
            <img
              src="{{ image }}"
              alt="Feature Image" class="rounded-2xl shadow-lg border border-gray-200 w-full h-auto object-cover">
          </div>
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "标题", "default": "深度集成工作流"},
                "description": {"type": "string", "title": "描述", "format": "textarea", "default": "与您使用的工具无缝连接：Jira、GitLab、Google Drive、Salesforce。在聊天中创建任务、分享文件、触发自动化。"},
                "image": {"type": "string", "title": "图片地址", "format": "uri", "default": "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=30"},
                "tags": {
                    "type": "array",
                    "title": "标签列表",
                    "items": {"type": "string"},
                    "default": ["Slack 导入", "API 开放"]
                }
            }
        }
    },
    {
        "name": "Showcase - 上文下图",
        "category": "Showcase",
        "html": """
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ title }}</h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">{{ subtitle }}</p>
        <div class="mt-12">
          <img
            src="{{ image }}"
            alt="Showcase" class="rounded-2xl shadow-xl border border-gray-200 w-full h-auto object-cover max-w-5xl mx-auto">
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "标题", "default": "全平台一致体验"},
                "subtitle": {"type": "string", "title": "副标题", "default": "无论是在桌面、网页还是移动端，消息实时同步，操作流畅如一。"},
                "image": {"type": "string", "title": "大图地址", "format": "uri", "default": "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=60"}
            }
        }
    },
    {
        "name": "Features - 四列网格",
        "category": "Features",
        "html": """
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">{{ title }}</h2>
          <p class="text-gray-600 mt-2">{{ subtitle }}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {{#each items}}
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 mb-4 text-xl">
              {{ icon }}
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ name }}</h3>
            <p class="text-gray-500 text-sm">{{ description }}</p>
          </div>
          {{/each}}
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "主标题", "default": "专为商务打造的特性"},
                "subtitle": {"type": "string", "title": "副标题", "default": "从安全到效率，面面俱到"},
                "items": {
                    "type": "array",
                    "title": "特性项",
                    "items": {
                        "type": "object",
                        "properties": {
                            "icon": {"type": "string", "title": "图标(Emoji)"},
                            "name": {"type": "string", "title": "特性名"},
                            "description": {"type": "string", "title": "描述"}
                        }
                    },
                    "default": [
                        {"icon": "🔒", "name": "企业级安全", "description": "端到端加密、SSO、DLP策略，满足合规需求。"},
                        {"icon": "⚡", "name": "实时同步", "description": "毫秒级延迟，跨设备已读回执与状态。"},
                        {"icon": "🧩", "name": "无限集成", "description": "连接200+企业应用，自定义机器人。"},
                        {"icon": "📊", "name": "分析洞察", "description": "团队活跃度、响应时间数据可视化。"}
                    ]
                }
            }
        }
    },
    {
        "name": "Team - 团队介绍",
        "category": "Team",
        "html": """
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">{{ title }}</h2>
          <p class="text-gray-600 mt-2">{{ subtitle }}</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          {{#each members}}
          <div class="text-center">
            <img src="{{ avatar }}" alt="{{ name }}" class="w-32 h-32 rounded-full mx-auto object-cover shadow-md border-2 border-white">
            <h3 class="font-semibold mt-4">{{ name }}</h3>
            <p class="text-gray-500 text-sm">{{ role }}</p>
          </div>
          {{/each}}
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "主标题", "default": "核心团队"},
                "subtitle": {"type": "string", "title": "副标题", "default": "来自全球顶尖企业的协作专家"},
                "members": {
                    "type": "array",
                    "title": "成员列表",
                    "items": {
                        "type": "object",
                        "properties": {
                            "avatar": {"type": "string", "title": "头像地址", "format": "uri"},
                            "name": {"type": "string", "title": "姓名"},
                            "role": {"type": "string", "title": "职位"}
                        }
                    },
                    "default": [
                        {"avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=30", "name": "张伟", "role": "CEO & 创始人"},
                        {"avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=30", "name": "陈敏", "role": "CTO"},
                        {"avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=30", "name": "王磊", "role": "产品总监"},
                        {"avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=30", "name": "李莉", "role": "设计负责人"}
                    ]
                }
            }
        }
    },
    {
        "name": "Stats - 数据统计栏",
        "category": "Stats",
        "html": """
    <section class="py-16 bg-indigo-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {{#each stats}}
          <div>
            <div class="text-4xl font-bold">{{ value }}</div>
            <div class="text-indigo-100 mt-2">{{ label }}</div>
          </div>
          {{/each}}
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "stats": {
                    "type": "array",
                    "title": "统计项",
                    "items": {
                        "type": "object",
                        "properties": {
                            "value": {"type": "string", "title": "数值"},
                            "label": {"type": "string", "title": "标签"}
                        }
                    },
                    "default": [
                        {"value": "500+", "label": "企业客户"},
                        {"value": "98%", "label": "客户留存率"},
                        {"value": "20M+", "label": "日消息量"},
                        {"value": "24/7", "label": "技术支持"}
                    ]
                }
            }
        }
    },
    {
        "name": "Pricing - 灵活定价",
        "category": "Pricing",
        "html": """
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">{{ title }}</h2>
          <p class="text-gray-600 mt-2">{{ subtitle }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          {{#each plans}}
          <div class="bg-white p-8 rounded-2xl shadow-sm border {{#if highlighted}}border-2 border-indigo-200 shadow-md relative{{else}}border-gray-200{{/if}}">
            {{#if highlighted}}<span class="absolute top-0 right-8 bg-indigo-600 text-white px-3 py-1 text-sm rounded-b-lg">最受欢迎</span>{{/if}}
            <h3 class="text-xl font-semibold">{{ name }}</h3>
            <p class="text-4xl font-bold mt-4">{{ price }}<span class="text-base font-normal text-gray-500">{{ unit }}</span></p>
            <ul class="mt-6 space-y-3 text-gray-600">
              {{#each features}}
              <li class="flex items-center gap-2">✓ {{this}}</li>
              {{/each}}
            </ul>
            <a href="{{ link }}"
              class="mt-8 block w-full text-center {{#if highlighted}}bg-indigo-600 text-white hover:bg-indigo-700{{else}}border border-indigo-600 text-indigo-600 hover:bg-indigo-50{{/if}} py-2 rounded-full font-medium transition-all">
              {{ btnText }}
            </a>
          </div>
          {{/each}}
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "主标题", "default": "灵活定价"},
                "subtitle": {"type": "string", "title": "副标题", "default": "按需选择，无隐藏费用"},
                "plans": {
                    "type": "array",
                    "title": "方案列表",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "title": "方案名"},
                            "price": {"type": "string", "title": "价格"},
                            "unit": {"type": "string", "title": "单位"},
                            "features": {"type": "array", "title": "特性", "items": {"type": "string"}},
                            "btnText": {"type": "string", "title": "按钮文字"},
                            "link": {"type": "string", "title": "链接"},
                            "highlighted": {"type": "boolean", "title": "突出显示"}
                        }
                    },
                    "default": [
                        {"name": "基础版", "price": "¥49", "unit": "/月/人", "features": ["消息历史1年", "10GB 文件存储", "基础集成"], "btnText": "选择基础版", "link": "#", "highlighted": False},
                        {"name": "商业版", "price": "¥99", "unit": "/月/人", "features": ["无限历史", "100GB 存储", "所有集成 + API", "高级支持"], "btnText": "选择商业版", "link": "#", "highlighted": True},
                        {"name": "企业版", "price": "定制", "unit": "", "features": ["本地部署选项", "无限存储", "专属客户成功", "SSO/合规"], "btnText": "联系销售", "link": "#", "highlighted": False}
                    ]
                }
            }
        }
    },
    {
        "name": "FAQ - 常见问题",
        "category": "FAQ",
        "html": """
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{{ title }}</h2>
        <div class="space-y-6">
          {{#each questions}}
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ question }}</h3>
            <p class="text-gray-600">{{ answer }}</p>
          </div>
          {{/each}}
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "主标题", "default": "常见问题"},
                "questions": {
                    "type": "array",
                    "title": "问题列表",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question": {"type": "string", "title": "问题"},
                            "answer": {"type": "string", "title": "回答", "format": "textarea"}
                        }
                    },
                    "default": [
                        {"question": "支持本地部署吗？", "answer": "是的，企业版支持私有云或本地服务器部署，满足最高安全合规要求。"},
                        {"question": "可以试用多久？", "answer": "所有新用户均可享受30天全功能免费试用，无需信用卡。"},
                        {"question": "数据存储在哪里？", "answer": "数据存储在云端的独立数据库，可选中国大陆或海外区域，符合当地法规。"},
                        {"question": "如何迁移现有聊天记录？", "answer": "我们提供专业迁移工具，支持从Slack、Teams等平台导入历史数据。"}
                    ]
                }
            }
        }
    },
    {
        "name": "CTA - 行动号召",
        "category": "CTA",
        "html": """
    <section class="bg-indigo-600 py-16">
      <div class="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white mb-4">{{ title }}</h2>
        <p class="text-indigo-100 text-lg mb-8">{{ subtitle }}</p>
        <div class="flex flex-wrap gap-4 justify-center">
          <a href="{{ primaryLink }}"
            class="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-full font-medium shadow-lg transition">{{ primaryText }}</a>
          <a href="{{ secondaryLink }}"
            class="border border-white text-white hover:bg-indigo-500 px-6 py-3 rounded-full font-medium transition">{{ secondaryText }}</a>
        </div>
      </div>
    </section>""",
        "schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "标题", "default": "立即提升团队协作效率"},
                "subtitle": {"type": "string", "title": "副标题", "default": "加入数百家信任我们的企业，开启高效沟通之旅。"},
                "primaryText": {"type": "string", "title": "主按钮文字", "default": "免费试用30天"},
                "primaryLink": {"type": "string", "title": "主按钮链接", "format": "uri", "default": "#"},
                "secondaryText": {"type": "string", "title": "次按钮文字", "default": "预约演示"},
                "secondaryLink": {"type": "string", "title": "次按钮链接", "format": "uri", "default": "#"}
            }
        }
    }
]

sql = "INSERT INTO block_templates (id, name, category, html_code, schema, origin, is_published) VALUES\n"
values = []
for t in templates:
    t_id = str(uuid.uuid4())
    escaped_html = t["html"].replace("'", "''")
    escaped_schema = json.dumps(t["schema"], ensure_ascii=False).replace("'", "''")
    values.append(f"('{t_id}', '{t['name']}', '{t['category']}', '{escaped_html}', '{escaped_schema}', 'USER', true)")

sql += ",\n".join(values) + ";"
print(sql)
