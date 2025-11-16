from src.apps.admin_panel.container import AdminPanelContainer
from src.apps.rest.container import MainContainer

container = MainContainer()

container.init_resources()

app = container.app_factory().with_routers(routers=[container.core_api_container.container.core_router()]).create()
admin_panel_app = AdminPanelContainer().admin_panel_factory().create(app)
