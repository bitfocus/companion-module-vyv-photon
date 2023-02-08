const { Regex, InstanceBase, TCPHelper, InstanceStatus, runEntrypoint } = require('@companion-module/base')

class instance extends InstanceBase {
	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.init_actions() // export actions

		this.init_tcp()
	}

	async configUpdated(config) {
		this.config = config

		this.init_tcp()
	}

	// When module gets deleted
	async destroy() {
		if (this.socket) {
			this.socket.destroy()
		}
	}

	init_tcp() {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.UnknownError, err.message)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('connect', () => {
				this.updateStatus(InstanceStatus.Ok)
				this.log('debug', 'Connected')
			})

			this.socket.on('data', (data) => {})
		}
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port (Default = 55503)',
				width: 6,
				default: 55503,
				regex: Regex.PORT,
			},
		]
	}

	init_actions() {
		const sendCommand = (cmd) => {
			this.log('debug', 'sending ' + cmd, +' to ' + this.config.host)

			if (this.socket && this.socket.isConnected) {
				this.socket.send(cmd + '\n')
			} else {
				this.log('debug', 'Socket not connected :(')
			}
		}

		this.setActionDefinitions({
			cue_exec: {
				label: 'Recall (cue)',
				options: [
					{
						type: 'textinput',
						label: 'Cue ID',
						id: 'cue',
						regex: Regex.NUMBER,
					},
				],
				callback: (action) => {
					const cmd = '<photon> CUE_EXEC_ID ' + action.options.cue + ' </photon>'
					sendCommand(cmd)
				},
			},
			spec_code: {
				label: 'Special Code',
				options: [
					{
						type: 'dropdown',
						label: 'Special Code',
						id: 's_code',
						choices: [
							{
								label: 'Restart Photon',
								id: '4',
							},
							{
								label: 'Reboot Server',
								id: '5',
							},
							{
								label: 'Quit Photon',
								id: '6',
							},
							{
								label: 'Shutdown Server',
								id: '7',
							},
							{
								label: 'Toggle UI Visibility',
								id: '10',
							},
						],
					},
				],
				callback: (action) => {
					const cmd = '<photon> 90BC9E48_6D84_4F8C_AA23_72E3379AC71C ' + action.options.s_code + ' </photon>'
					sendCommand(cmd)
				},
			},
		})
	}
}

runEntrypoint(instance, [])
