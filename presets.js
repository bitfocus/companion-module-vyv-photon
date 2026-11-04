import { combineRgb } from '@companion-module/base'
import { DEFAULT_CUES } from './cues.js'

export function getPresetDefinitions() {
	const presets = {}
	const presetIds = []

	for (const cue of DEFAULT_CUES) {
		const presetId = `recall_default_cue_${cue.id}`
		presetIds.push(presetId)
		presets[presetId] = {
			type: 'simple',
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

	const structure = [
		{
			id: 'default_cues',
			name: 'Default Cues',
			definitions: [
				{
					id: 'default_cues_group',
					type: 'simple',
					name: 'Default Cues',
					presets: presetIds,
				},
			],
		},
	]

	return { structure, presets }
}
