import { DEFAULT_CUES } from './cues.js'

export function getActionDefinitions(self) {
	return {
		recall_custom_cue: {
			name: 'Recall custom cue',
			options: [
				{
					type: 'number',
					id: 'cue',
					label: 'Cue ID',
					default: 1,
					min: 0,
					max: 99999,
					step: 1,
					asInteger: true,
				},
			],
			callback: (action) => {
				self.sendCommand(`<photon> CUE_EXEC_ID ${action.options.cue} </photon>`)
			},
		},
		recall_default_cue: {
			name: 'Recall default cue',
			options: [
				{
					type: 'dropdown',
					id: 'cue',
					label: 'Default Cue',
					default: DEFAULT_CUES[0].id,
					minChoicesForSearch: 0,
					choices: DEFAULT_CUES,
				},
			],
			callback: (action) => {
				self.sendCommand(`<photon> CUE_EXEC_ID ${action.options.cue} </photon>`)
			},
		},
	}
}
