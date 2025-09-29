from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Dependency, Factory

from src.apps.rest.core.pizzas.create_pizza.controller import (
    CreatePizzaController,
)
from src.apps.rest.core.pizzas.get_pizzas.controller import (
    GetPizzasController,
)
from src.apps.rest.core.pizzas.router import PizzasRouter
from src.apps.rest.core.router import CoreRouter
from src.contexts.core.infrastructure.container import CoreContainer
from src.contexts.shared.settings import Settings
from sqlalchemy.orm import Session


class CoreAPIContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    settings = Dependency(instance_of=Settings)
    sqlalchemy_session = Dependency(instance_of=Session)

    # ====================================================================================

    core_container = Container(
        CoreContainer, settings=settings, sqlalchemy_session=sqlalchemy_session
    )

    get_pizzas_controller: Factory[GetPizzasController] = Factory(
        GetPizzasController,
        get_pizzas_use_case=core_container.container.get_pizzas_query_handler,
    )
    create_pizza_controller = Factory(
        CreatePizzaController,
        create_pizza_use_case=core_container.container.create_pizza_command_handler,
    )

    pizzas_router: Factory[PizzasRouter] = Factory(
        PizzasRouter,
        get_pizzas_controller=get_pizzas_controller,
        create_pizza_controller=create_pizza_controller,
    )

    # ============================== CONTAINER EXPORTS ===================================

    core_router: Factory[CoreRouter] = Factory(CoreRouter, pizzas_router=pizzas_router)

    # ====================================================================================
