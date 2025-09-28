from src.apps.rest.container import MainContainer

app = MainContainer().app_factory().create()
