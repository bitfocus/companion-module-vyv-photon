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

export const UpgradeScripts = [
	// cue_exec (numeric-only cue recall) became recall_custom_cue. The
	// 'cue' option id and semantics are unchanged, so only the action id
	// needs to move.
	renameActionIds({
		cue_exec: 'recall_custom_cue',
	}),
]
