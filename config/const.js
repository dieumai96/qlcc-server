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
module.exports = internals;