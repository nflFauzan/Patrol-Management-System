"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentStatus = exports.IncidentSeverity = exports.SosStatus = exports.CheckpointCondition = exports.PatrolStatus = exports.AttendanceStatus = exports.Division = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN_SUPER"] = "ADMIN_SUPER";
    UserRole["OPS_MANAGER"] = "OPS_MANAGER";
    UserRole["SITE_SUPERVISOR"] = "SITE_SUPERVISOR";
    UserRole["SECURITY_OFFICER"] = "SECURITY_OFFICER";
    UserRole["CLEANER"] = "CLEANER";
    UserRole["DRIVER"] = "DRIVER";
})(UserRole || (exports.UserRole = UserRole = {}));
var Division;
(function (Division) {
    Division["SECURITY"] = "SECURITY";
    Division["CLEANING"] = "CLEANING";
    Division["DRIVER"] = "DRIVER";
})(Division || (exports.Division = Division = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["IN"] = "IN";
    AttendanceStatus["OUT"] = "OUT";
    AttendanceStatus["SICK"] = "SICK";
    AttendanceStatus["PERMISSION"] = "PERMISSION";
    AttendanceStatus["ALPHA"] = "ALPHA";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var PatrolStatus;
(function (PatrolStatus) {
    PatrolStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PatrolStatus["COMPLETED"] = "COMPLETED";
    PatrolStatus["MISSED"] = "MISSED";
    PatrolStatus["ABORTED"] = "ABORTED";
})(PatrolStatus || (exports.PatrolStatus = PatrolStatus = {}));
var CheckpointCondition;
(function (CheckpointCondition) {
    CheckpointCondition["NORMAL"] = "NORMAL";
    CheckpointCondition["ABNORMAL"] = "ABNORMAL";
    CheckpointCondition["MAINTENANCE_REQUIRED"] = "MAINTENANCE_REQUIRED";
})(CheckpointCondition || (exports.CheckpointCondition = CheckpointCondition = {}));
var SosStatus;
(function (SosStatus) {
    SosStatus["ACTIVE"] = "ACTIVE";
    SosStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    SosStatus["RESOLVED"] = "RESOLVED";
    SosStatus["FALSE_ALARM"] = "FALSE_ALARM";
})(SosStatus || (exports.SosStatus = SosStatus = {}));
var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["LOW"] = "LOW";
    IncidentSeverity["MEDIUM"] = "MEDIUM";
    IncidentSeverity["HIGH"] = "HIGH";
    IncidentSeverity["CRITICAL"] = "CRITICAL";
})(IncidentSeverity || (exports.IncidentSeverity = IncidentSeverity = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["OPEN"] = "OPEN";
    IncidentStatus["INVESTIGATING"] = "INVESTIGATING";
    IncidentStatus["RESOLVED"] = "RESOLVED";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
//# sourceMappingURL=index.js.map