const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get weather information.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get weather information.')
                .addStringOption(option =>
                    option
                        .setName('country')
                        .setDescription('The name of the country.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('city_name')
                        .setDescription('The name of the city you want to get the current weather in.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const key = process.env.WEATHERSTACK_API_KEY;

        if (interaction.options.getSubcommand() === 'info') {
            const country = interaction.options.getString('country', true);
            const city = interaction.options.getString('city_name', true);

            axios.get(`https://api.weatherstack.com/current?access_key=${key}&query=${city},${country}&units=m`)
                .then(async function (response) {
                    const data = response.data;
                    const current = data.current;

                    let offset = Math.round(data.location.utc_offset);

                    if (offset >= 0) {offset = `+${offset}`}
                    else {offset = `${offset}`}

                    let uvIndex = current.uv_index;

                    if (uvIndex <= 2) {uvIndex = `${uvIndex} (Low)`}
                    else if (uvIndex >= 3 && uvIndex <= 5) {uvIndex = `${uvIndex} (Medium)`}
                    else if (uvIndex >= 6 && uvIndex <= 7) {uvIndex = `${uvIndex} (High)`}
                    else if (uvIndex >= 8 && uvIndex <= 10) {uvIndex = `${uvIndex} (Very high)`}
                    else if (uvIndex >= 11) {uvIndex = `${uvIndex} (EXTREME)`}

                    const mbed = new EmbedBuilder()
                        .setColor(0xFFFFFF)
                        .setAuthor({ name: 'Powered by Weatherstack (tm)', iconURL: 'https://play-lh.googleusercontent.com/AzHUahYbu3Ks264NC261eGTKcswBa9LsrIt0oAquqcEU056dO2ukd7yhH35oVwRh4lM', url: 'https://weatherstack.com' })
                        .setTitle(`Weather in ${data.request.query}.`)
                        .setThumbnail(`${current.weather_icons[0]}`)
                        .addFields(
                            {name: 'Observation time:', value: `${current.observation_time} UTC`, inline: true},
                            {name: 'Local time and date:', value: `${data.location.localtime}\n(Timezone: UTC${offset})`, inline: true},
                            {name: 'Weather stats', value: codeBlock('yaml', `Temperature: ${current.temperature}°C (Feels like ${current.feelslike}°C), ${current.weather_descriptions[0]}\nWind: ${Math.round(current.wind_speed * 1000 / 3600)} m/s ${current.wind_degree}° ${current.wind_dir}\nAtmospheric pressure: ${current.pressure * 0.75} mmHg\nPrecipitation: ${current.precip} mm; Humidity: ${current.humidity}%\nVisibility: ${current.visibility} km\nUV Index: ${uvIndex}`)})
                        .setTimestamp()
                        .setFooter({ text: 'Spy' });

                    await interaction.followUp({ embeds: [mbed] });
                })

                .catch(async function (error) {
                    console.error(error);

                    const errorMbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('Error.')
                        .setDescription(`${error}`)
                        .setThumbnail(`https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png`)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' });

                    await interaction.followUp({ embeds: [errorMbed] });
                })

        }
    },
};