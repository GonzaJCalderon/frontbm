// utils/prepareFormData.js
const prepareFormData = (bienData, files) => {
    const formData = new FormData();
    Object.keys(bienData).forEach(key => {
        formData.append(key, bienData[key]);
    });
    files.forEach(file => {
        formData.append('fotos', file);
    });
    return formData;
};

export default prepareFormData;
