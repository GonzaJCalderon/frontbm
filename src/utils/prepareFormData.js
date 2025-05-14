const prepareFormData = (bienData, files) => {
    const formData = new FormData();

    // Agregar datos del bien
    Object.keys(bienData).forEach((key) => {
        formData.append(key, bienData[key]);
    });

    // Agregar archivos (asegúrate de que files sea un array de objetos File o Blob)
    if (files && files.length > 0) {
        files.forEach((file) => {
            formData.append('fotos', file); // 'fotos' debe coincidir con el campo que espera el backend
        });
    } else {
    }

    return formData;
};

export default prepareFormData;
