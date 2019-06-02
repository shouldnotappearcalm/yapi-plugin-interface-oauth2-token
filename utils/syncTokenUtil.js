const schedule = require('node-schedule');
const projectModel = require('models/project.js');
const oauthModel = require('../model/oauthModel.js');
const yapi = require('yapi.js')
const jobMap = new Map();

class syncTokenUtils {

    constructor(ctx) {
        yapi.commons.log("-------------------------------------tokenSyncUtils constructor-----------------------------------------------");
        this.ctx = ctx;
        this.oauthModel = yapi.getInst(oauthModel);
        this.projectModel = yapi.getInst(projectModel);
        this.init()
    }

    //初始化token获取定时任务
    async init() {
        
    }

    async addSyncJob(oauthData) {

    }

    getSyncJob(projectId) {
        return jobMap.get(projectId);
    }

    deleteSyncJob(oauthData) {
        let uniqueId = getUniqueId(oauthData.project_id, oauthData.env_id);
        let jobItem = jobMap.get(uniqueId);
        if (jobItem) {
            jobItem.cancel();
        }
    }
    
    getUniqueId(projectId, envId) {
        return projectId + "-" + envId;
    }

}

module.exports = syncTokenUtils;