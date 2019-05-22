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
module.exports = internals;