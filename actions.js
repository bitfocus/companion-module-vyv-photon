import { Regex, InstanceStatus } from '@companion-module/base'
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
					label: 'Special Code',
					id: 's_code',
					choices: [
						{ label: 'Restart Photon', id: '4' },
						{ label: 'Reboot Server', id: '5' },
						{ label: 'Quit Photon', id: '6' },
						{ label: 'Shutdown Server', id: '7' },
						{ label: 'Toggle UI Visibility', id: '10' },
					],
					default: '4',
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
					label: 'New Port',
					id: 'new_port',
					regex: Regex.PORT,
				},
			],
			callback: (action) => {
				const newConfig = { ...self.config, port: parseInt(action.options.new_port) }

				// 1) Persist to disk immediately
				self.saveConfig(newConfig)

				// 2) Immediately tear down/re-initialize the TCP socket on the new port
				self.config = newConfig
				self.setVariableValues({ target_port: newConfig.port.toString() })
				self.updateStatus(InstanceStatus.Connecting)
				self.init_tcp()
			},
		},
		update_ip: {
			name: 'Update Target IP Address',
			options: [
				{
					type: 'textinput',
					label: 'New IP Address',
					id: 'new_ip',
					regex: Regex.IP,
				},
			],
			callback: (action) => {
				const newConfig = { ...self.config, host: action.options.new_ip }

				// 1) Persist to disk immediately
				self.saveConfig(newConfig)

				// 2) Immediately tear down/re-initialize the TCP socket on the new IP
				self.config = newConfig
				self.setVariableValues({ target_ip: newConfig.host })
				self.updateStatus(InstanceStatus.Connecting)
				self.init_tcp()
			},
		},
	}
}
