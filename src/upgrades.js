// v3.0.0 replaced the pre-v3 action set with new action ids. This script
// keeps previously configured buttons working by remapping them onto their
// v3 equivalents.
function renameActionIds(idMap) {
	return (_context, props) => {
		const updatedActions = []
		for (const action of props.actions) {
			const newActionId = idMap[action.actionId]
			if (newActionId) {
				action.actionId = newActionId
				updatedActions.push(action)
			}
		}
		return {
			updatedConfig: null,
			updatedActions,
			updatedFeedbacks: [],
		}
	}
}

// Target Port setting changed from a text input to a number input
function portConfigToNumber(_context, props) {
	const config = props.config
	if (config && typeof config.port === 'string') {
		const port = parseInt(config.port, 10)
		if (Number.isInteger(port)) {
			return { updatedConfig: { ...config, port }, updatedActions: [], updatedFeedbacks: [] }
		}
	}
	return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
}

// "New Port" option of update_port changed from a text input to a number input
function newPortActionToNumber(_context, props) {
	const updatedActions = []
	for (const action of props.actions) {
		if (action.actionId !== 'update_port') continue
		const opt = action.options?.new_port
		if (opt && typeof opt === 'object' && opt.isExpression === false && typeof opt.value === 'string') {
			const value = parseInt(opt.value, 10)
			if (Number.isInteger(value)) {
				action.options.new_port = { isExpression: false, value }
				updatedActions.push(action)
			}
		}
	}
	return { updatedConfig: null, updatedActions, updatedFeedbacks: [] }
}

export const UpgradeScripts = [
	// cue_exec (numeric-only cue recall) became recall_custom_cue. The
	// 'cue' option id and semantics are unchanged, so only the action id
	// needs to move.
	renameActionIds({
		cue_exec: 'recall_custom_cue',
	}),
	portConfigToNumber,
	newPortActionToNumber,
]
