import { combineRgb } from '@companion-module/base'
import { DEFAULT_CUES } from './cues.js'

export function getPresetDefinitions() {
	const presets = {}

	for (const cue of DEFAULT_CUES) {
		presets[`recall_default_cue_${cue.id}`] = {
			type: 'button',
			category: 'Default Cues',
			name: cue.label,
			style: {
				text: cue.label,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'recall_default_cue',
							options: { cue: cue.id },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	return presets
}
