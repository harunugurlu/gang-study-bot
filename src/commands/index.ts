import * as ping from "./ping";
import * as lofi from "./lofi";

export const commands = {
    ping: {
      ...ping,
      requireVoiceChannel: ping.requireVoiceChannel,
    },
    lofi: {
      ...lofi,
      requireVoiceChannel: lofi.requireVoiceChannel,
    },
};
