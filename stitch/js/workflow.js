// workflow.js - Workflow configuration
const workflow = {
    async loadWorkflows() {
        try {
            return await api.get('/approvals/configure');
        } catch (error) {
            console.error('Failed to load workflows:', error);
            throw error;
        }
    },

    async save(steps, conditionalRules) {
        try {
            return await api.post('/approvals/configure', { steps, conditionalRules });
        } catch (error) {
            console.error('Failed to save workflow:', error);
            throw error;
        }
    },

    async appendStep(step) {
        try {
            const flow = await this.loadWorkflows();
            const steps = flow.steps || [];
            steps.push({ ...step, order: steps.length + 1 });
            return await this.save(steps, flow.conditionalRules);
        } catch (error) {
            console.error('Failed to append step:', error);
            throw error;
        }
    }
};