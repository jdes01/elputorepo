from dataclasses import dataclass
from src.contexts.core.domain.value_objects.company_id import CompanyId
from src.contexts.core.domain.value_objects.employee_id import EmployeeId
from src.contexts.core.domain.value_objects.shift_id import ShiftId
from src.contexts.shared.domain.domain_event import DomainEvent


@dataclass
class ShiftStarted(DomainEvent):
    shift_id: ShiftId
    employee_id: EmployeeId
    company_id: CompanyId
