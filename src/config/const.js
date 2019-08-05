let internals = {}

internals.STATUS = {
    WAIT_ACTIVE: 1,
    ACTIVE: 2,
    REJECT: 3,
    DELETE: 9
}

internals.USER_TYPE = {
    EMPLOYEE: 'Employee',
    USER: 'User'
}

internals.NOTIFICATION = {
    NOTIFICATION: 'Notification'
}

internals.SCOPE_NOTIFICATION = {
    ALL: 1,
    BUILDING: 2,
    FLAT: 3,
}

internals.DML_TYPE = {
    INSERT: 'Insert',
    UPDATE: 'Update',
}

internals.DATA_TYPE = {
    NOTIFICATION: 'Notification',
    EVENT_USER: 'EventUser',
    EVENT_EMPLOYEE: 'EventEmployee',
}

internals.ROLES = {
    ADMIN: 'ADMIN',
    RCN: 'RCN',
    TN : 'TN',
}

internals.NOTIFY_STATUS = {
    SEND: 2,
    NOT_SEND: 1,
}

internals.MESSAGE = {
    PERMISION : 'Bạn không có quyền thực hiện thao tác này'
}
module.exports = internals;