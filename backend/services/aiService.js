/**
 * AI Logic for Smart Features
 * In a real-world scenario, this might call an LLM API.
 * Here, we implement the logic based on heuristics.
 */

/**
 * Suggests task priority based on deadline and complexity keywords
 */
exports.suggestPriority = (dueDate, description = '') => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    const urgentKeywords = ['critical', 'urgent', 'asap', 'blocker', 'immediately'];
    const highKeywords = ['important', 'fix', 'error', 'bug', 'client'];

    let score = 0;

    // Deadline score
    if (diffDays <= 1) score += 4;
    else if (diffDays <= 3) score += 2;
    else if (diffDays <= 7) score += 1;

    // Keyword score
    const descLower = description.toLowerCase();
    if (urgentKeywords.some(k => descLower.includes(k))) score += 3;
    else if (highKeywords.some(k => descLower.includes(k))) score += 1;

    if (score >= 6) return 'Urgent';
    if (score >= 4) return 'High';
    if (score >= 2) return 'Medium';
    return 'Low';
};

/**
 * Suggests best member for a task based on workload
 */
exports.suggestAssignee = (members, tasks) => {
    if (!members || members.length === 0) return null;

    // Count tasks per member
    const workload = {};
    members.forEach(m => workload[m._id] = 0);

    tasks.forEach(t => {
        if (t.assignedTo && workload[t.assignedTo]) {
            workload[t.assignedTo]++;
        }
    });

    // Find member with minimum tasks
    let minTasks = Infinity;
    let suggestedMemberId = members[0]._id;

    Object.keys(workload).forEach(mId => {
        if (workload[mId] < minTasks) {
            minTasks = workload[mId];
            suggestedMemberId = mId;
        }
    });

    return suggestedMemberId;
};
