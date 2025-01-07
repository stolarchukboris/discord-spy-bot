import { SlashCommandBuilder, EmbedBuilder, codeBlock, Colors } from 'discord.js';
import axios from 'axios';

export const data = new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get weather information.')
    .addSubcommand(subcommand => subcommand
        .setName('info')
        .setDescription('Get weather information.')
        .addStringOption(option => option
            .setName('country')
            .setDescription('The name of the country.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('city_name')
            .setDescription('The name of the city you want to get the current weather in.')
            .setRequired(true)
        )
    );
export async function execute(interaction) {
    await interaction.deferReply();

    const key = process.env.WEATHERSTACK_API_KEY;

    if (interaction.options.getSubcommand() === 'info') {
        const country = interaction.options.getString('country', true);
        const city = interaction.options.getString('city_name', true);
        const response = await axios.get(`https://api.weatherstack.com/current?access_key=${key}&query=${city},${country}&units=m`);
        const current = response.data.current;

        let offset = Math.round(current.location.utc_offset);

        if (offset >= 0) { offset = `+${offset}` }
        else { offset = `${offset}` };

        let uvIndex = current.uv_index;

        if (uvIndex <= 2) { uvIndex = `${uvIndex} (Low)` }
        else if (uvIndex >= 3 && uvIndex <= 5) { uvIndex = `${uvIndex} (Medium)` }
        else if (uvIndex >= 6 && uvIndex <= 7) { uvIndex = `${uvIndex} (High)` }
        else if (uvIndex >= 8 && uvIndex <= 10) { uvIndex = `${uvIndex} (Very high)` }
        else if (uvIndex >= 11) { uvIndex = `${uvIndex} (EXTREME)` };

        const mbed = new EmbedBuilder()
            .setColor(Colors.Grey)
            .setAuthor({ name: 'Powered by Weatherstack (tm)', iconURL: 'https://play-lh.googleusercontent.com/AzHUahYbu3Ks264NC261eGTKcswBa9LsrIt0oAquqcEU056dO2ukd7yhH35oVwRh4lM', url: 'https://weatherstack.com' })
            .setTitle(`Weather in ${data.request.query}.`)
            .setThumbnail(`${current.weather_icons[0]}`)
            .addFields(
                { name: 'Observation time:', value: `${current.observation_time} UTC`, inline: true },
                { name: 'Local time and date:', value: `${data.location.localtime}\n(Timezone: UTC${offset})`, inline: true },
                { name: 'Weather stats', value: codeBlock('yaml', `Temperature: ${current.temperature}°C (Feels like ${current.feelslike}°C), ${current.weather_descriptions[0]}
Wind: ${Math.round(current.wind_speed * 1000 / 3600)} m/s ${current.wind_degree}° ${current.wind_dir}
Atmospheric pressure: ${current.pressure * 0.75} mmHg
Precipitation: ${current.precip} mm; Humidity: ${current.humidity}%
Visibility: ${current.visibility} km
UV Index: ${uvIndex}`) })
            .setTimestamp()
            .setFooter({ text: 'Spy' });

        return await interaction.followUp({ embeds: [mbed] });
    };
};