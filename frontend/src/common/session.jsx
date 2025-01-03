const storeInsesson = (key, value) => {
    return sessionStorage.setItem(key, value);
}

const lookInSession = (key) => {
    return sessionStorage.getItem(key);
}

const removeInSession = (key) => {
    return sessionStorage.removeItem(key);
}

const logoutInSession = (key) => {
    return sessionStorage.clear();
}

export { storeInsesson, lookInSession, removeInSession, logoutInSession } ;