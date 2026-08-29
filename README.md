# companion-module-vyv-photon

A [Bitfocus Companion](https://bitfocus.io/companion) module for controlling [VYV Photon](https://www.vyv.ca/products/photon/) over TCP.

## What is VYV Photon?

[PHOTON](https://www.vyv.ca/products/photon/) is VYV's flagship media server, in production since 2004 and used on projects ranging from large-scale architectural installations to world tours. It handles real-time media treatment and delivery, volumetric mapping and tracking onto complex geometries, and uncompressed video playback, with automatic projector alignment/blending via light sensors, cameras, and optical markers. It integrates with lighting and show-control systems over MIDI, Art-Net, OSC, TCP and UDP, and supports NDI, PosiStageNet output alongside a full editing timeline with real-time colour grading.

See [vyv.ca](https://www.vyv.ca/products/photon/) for full product details.

### Compatibility with Xenon and Tachyon

This module also works with VYV's [Xenon](https://www.vyv.ca/products/xenon/) and [Tachyon](https://tachyon.video/) media servers — they share Photon's command protocol. Tested and confirmed working against a Xenon dev instance.

## Configuration

| Field | Description |
| --- | --- |
| Target IP | IP address of the Photon/Xenon/Tachyon server |
| Target Port | TCP port (default `55503`) |
| Enable verbose logging | Logs detailed connection/command activity for troubleshooting |

## Actions

- **Recall custom cue** — Recall any cue by entering its numeric ID.
- **Recall default cue** — Recall one of Photon's built-in default cues from a searchable dropdown (Play, Pause, Universal Crossfade, Auto-Play, Master In/Out points, etc).
- **Special Code** — Send a special code (Restart Photon, Reboot Server, Quit Photon, Shutdown Server, Toggle UI Visibility).
- **Update Target Port** — Change the connection's target port from a button.
- **Update Target IP** — Change the connection's target IP address from a button.

The two cue actions send the underlying `CUE_EXEC_ID` command.

## Presets

A button preset is provided for every default cue, listed under the "Default Cues" category, so you can drag a ready-made button straight onto a page.

## Variables

| Variable | Description |
| --- | --- |
| `connection_status` | Current connection state (`connected`, `connecting`, `disconnected`, `bad_config`, `unknown`) |
| `target_ip` | Configured target IP address |
| `target_port` | Configured target port |
| `connection_failures` | Consecutive connection failure count |

## Support

For bugs or feature requests, please raise an issue on [GitHub](https://github.com/bitfocus/companion-module-vyv-photon/issues).
