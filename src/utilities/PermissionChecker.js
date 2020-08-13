export default class PermissionChecker {
    static check(userInfo, secShortName, opShortName) {
        if (userInfo != null) {
            var securableItem = userInfo.securableItem;
            for (var i = 0; i < securableItem.length; i++) {
                if (securableItem[i].shortName === secShortName) {
                    for (var j = 0; j < securableItem[i].operations.length; j++) {
                        if (securableItem[i].operations[j].shortName === opShortName) {
                            return securableItem[i].operations[j].status;
                        }
                    }
                }
            }
        }
        return false;
    }
}