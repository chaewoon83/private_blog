let months = ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const getDay = (timestamp) => {
    let date = new Date(timestamp);
    return `${date.getDate()} ${months[date.getMonth()]}`

}

export const getFullday = (timestamp) => {
    let date = new Date(timestamp);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}