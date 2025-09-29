from src.apps.rest.container import MainContainer
from src.apps.admin_panel.container import AdminPanelContainer

app = MainContainer().app_factory().create()
admin_panel_app = AdminPanelContainer().admin_panel_factory().create(app)