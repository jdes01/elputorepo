from mongoengine import Document, IntField, StringField


class AllEventsProjectionSchema(Document):
    event_id = StringField(required=True, unique=True)
    name = StringField(required=True)
    capacity = IntField(required=True)

    meta = {
        "collection": "all-events",
        "indexes": ["event_id"],
    }
