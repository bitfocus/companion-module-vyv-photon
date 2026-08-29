import { InstanceStatus, Regex } from '@companion-module/base'
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
		spec_code: {
			name: 'Special Code',
			options: [
				{
					type: 'dropdown',
					id: 's_code',
					label: 'Special Code',
					default: '4',
					choices: [
						{ label: 'Restart Photon', id: '4' },
						{ label: 'Reboot Server', id: '5' },
						{ label: 'Quit Photon', id: '6' },
						{ label: 'Shutdown Server', id: '7' },
						{ label: 'Toggle UI Visibility', id: '10' },
					],
				},
			],
			callback: (action) => {
				self.sendCommand(`<photon> 90BC9E48_6D84_4F8C_AA23_72E3379AC71C ${action.options.s_code} </photon>`)
			},
		},
		update_port: {
			name: 'Update Target Port',
			options: [
				{
					type: 'textinput',
					id: 'new_port',
					label: 'New Port',
					regex: Regex.PORT,
				},
			],
			callback: (action) => {
				const newConfig = { ...self.config, port: parseInt(action.options.new_port) }
				self.saveConfig(newConfig)
				self.config = newConfig
				self.setVariableValues({ target_port: newConfig.port.toString() })
				self.updateStatus(InstanceStatus.Connecting)
				self.init_tcp()
			},
		},
		update_ip: {
			name: 'Update Target IP',
			options: [
				{
					type: 'textinput',
					id: 'new_ip',
					label: 'New IP Address',
					regex: Regex.IP,
				},
			],
			callback: (action) => {
				const newConfig = { ...self.config, host: action.options.new_ip }
				self.saveConfig(newConfig)
				self.config = newConfig
				self.setVariableValues({ target_ip: newConfig.host })
				self.updateStatus(InstanceStatus.Connecting)
				self.init_tcp()
			},
		},
	}
}
