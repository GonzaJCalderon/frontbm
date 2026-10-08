import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../redux/actions/auth";
import Notification from "./Notification";
import registerImage from "../assets/registerimg.png";
import api from "../redux/axiosConfig"; // Axios configuration for API calls

const departments = [
  "Capital",
  "Godoy Cruz",
  "Junín",
  "Las Heras",
  "Maipú",
  "Guaymallén",
  "Rivadavia",
  "San Martín",
  "La Paz",
  "Santa Rosa",
  "General Alvear",
  "Malargüe",
  "San Carlos",
  "Tupungato",
  "Tunuyán",
  "San Rafael",
  "Lavalle",
  "Luján de Cuyo",
];

const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState(null);

  return useCallback(
    (...args) => {
      if (debounceTimer) clearTimeout(debounceTimer);

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer],
  );
};

const Register = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    tipo: "fisica",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    dni: "",
    cuil: "",
    razonSocial: "",
    direccionEmpresa: { calle: "", altura: "", departamento: "" },

    direccion: { calle: "", altura: "", barrio: "", departamento: "" },
    cuit: "",

    // 🆕 NUEVOS CAMPOS PARA RESPONSABLE (solo juridica)
    dniResponsable: "",
    nombreResponsable: "",
    apellidoResponsable: "",
    cuitResponsable: "",
    provinciaResponsable: "",
    domicilioResponsable: {
      calle: "",
      altura: "",
      barrio: "",
      departamento: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [renaperError, setRenaperError] = useState("");
  const [renaperData, setRenaperData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRenaper, setLoadingRenaper] = useState(false);
  const [step, setStep] = useState(1);

  const esDeMendoza = (provincia) =>
    provincia?.toUpperCase().includes("MENDOZA");

  const validateDNIWithRenaper = async (dni) => {
    try {
      if (!dni) {
        setRenaperError("El DNI es obligatorio.");
        setLoadingRenaper(false);
        return;
      }

      const { data } = await api.get(`/renaper/${dni}`);

      if (data.resultado === 0 && data.persona) {
        const persona = data.persona;
        const provincia = persona.domicilio.provincia || "";
        const localidad = persona.domicilio.localidad || "";

        if (persona.fallecido) {
          setRenaperError(
            "Esta persona figura como fallecida y no puede registrarse.",
          );
          setRenaperData(null);
          setLoadingRenaper(false);
          return;
        }
        const mendoza = esDeMendoza(provincia);

        // ✅ Si es de Mendoza, usamos el nombre normalizado
        // ✅ Si no, guardamos la localidad devuelta por RENAPER directamente
        const departamentoFinal = mendoza
          ? normalizarDepartamento(localidad)
          : localidad || "Sin localidad registrada";

        if (!mendoza) {
          setRenaperError(
            `⚠️ Esta persona no reside en Mendoza (${provincia}). Se usará la localidad proporcionada: ${localidad || "No informada"}.`,
          );
        } else {
          setRenaperError("");
        }

        setFormData((prev) => ({
          ...prev,
          nombre: persona.nombres,
          apellido: persona.apellidos,
          direccion: {
            calle: persona.domicilio.calle || "",
            altura: persona.domicilio.nroCalle || "",
            barrio: persona.domicilio.barrio || "",
            departamento: departamentoFinal, // 👈 cambio clave
          },
          cuil: persona.nroCuil,
          provincia,
        }));

        setRenaperData(persona);
      } else {
        setRenaperError(data.mensaje || "Persona no encontrada en Renaper.");
        setRenaperData(null);
      }
    } catch (error) {
      setRenaperError("Error al validar el DNI.");
      setRenaperData(null);
    } finally {
      setLoadingRenaper(false); // 🆕 AGREGAR ESTA LÍNEA
    }
  };

  const validateDNIResponsableWithRenaper = async (dni) => {
    try {
      const { data } = await api.get(`/renaper/${dni}`);
      if (data.resultado === 0 && data.persona && !data.persona.fallecido) {
        const p = data.persona;
        const provincia = p.domicilio.provincia || "";
        const localidad = p.domicilio.localidad || "";
        const mendoza = esDeMendoza(provincia);

        const depNormalizado = mendoza ? normalizarDepartamento(localidad) : "";

        if (!mendoza) {
          setRenaperError(
            "⚠️ El responsable no reside en Mendoza. Completá el departamento manualmente.",
          );
        } else {
          setRenaperError("");
        }

        setFormData((prev) => ({
          ...prev,
          provinciaResponsable: provincia,
          cuitResponsable: p.nroCuil,
          nombreResponsable: p.nombres,
          apellidoResponsable: p.apellidos,
          domicilioResponsable: {
            calle: p.domicilio.calle || "",
            altura:
              p.domicilio.nroCalle > 0 ? String(p.domicilio.nroCalle) : "S/N",
            barrio: p.domicilio.barrio || "",
            departamento: depNormalizado,
          },
        }));
      } else {
        setRenaperError("No se pudo validar el DNI del responsable.");
      }
    } catch (e) {
      setRenaperError("Error al validar el DNI del responsable.");
    } finally {
      setLoadingRenaper(false); // 🆕 AGREGAR ESTA LÍNEA
    }
  };

  const normalizarDepartamento = (localidad) => {
    if (!localidad) return "";

    // Match por nombre ignorando tildes y case
    const match = departments.find(
      (dep) =>
        dep
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase() ===
        localidad
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase(),
    );

    return match || ""; // Devuelve el departamento formateado si hay match
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value))
        error = "Por favor, ingresa un correo electrónico válido.";
    }

    if (name === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(value)) {
        error =
          "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
      }
    }

    if (name === "cuit" && value && !/^\d{11}$/.test(value)) {
      error = "El CUIT debe ser un número de 11 dígitos.";
    }

    if (name === "dni" && value && !/^\d{7,8}$/.test(value)) {
      error = "El DNI debe ser un número de 7 u 8 dígitos.";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const lowercasedValue = name === "email" ? value.toLowerCase() : value;

    if (["calle", "altura", "barrio", "departamento"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        direccion: { ...prev.direccion, [name]: lowercasedValue },
      }));
    } else if (["calleEmpresa", "alturaEmpresa"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        direccionEmpresa: {
          ...prev.direccionEmpresa,
          [name.replace("Empresa", "")]: lowercasedValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: lowercasedValue }));

      // 🆕 VALIDACIÓN AUTOMÁTICA PARA DNI (NUEVO CÓDIGO)
      if (name === "dni" && value.length >= 7) {
        setLoadingRenaper(true);
        setRenaperError("");
        debouncedValidateDNI(value);
      }

      // 🆕 VALIDACIÓN AUTOMÁTICA PARA DNI RESPONSABLE (NUEVO CÓDIGO)
      if (name === "dniResponsable" && value.length >= 7) {
        setLoadingRenaper(true);
        setRenaperError("");
        debouncedValidateDNIResponsable(value);
      }
    }

    validateField(name, lowercasedValue);
  };

  const debouncedValidateDNI = useDebounce(validateDNIWithRenaper, 2000);
  const debouncedValidateDNIResponsable = useDebounce(
    validateDNIResponsableWithRenaper,
    2000,
  );

  const validarCampos = () => {
    const nuevosErrores = {};
    const esFisica = formData.tipo === "fisica";
    const esJuridica = formData.tipo === "juridica";

    // Validaciones comunes
    if (!formData.email) nuevosErrores.email = "Este campo es obligatorio";
    if (!formData.password)
      nuevosErrores.password = "Este campo es obligatorio";
    if (!formData.confirmPassword)
      nuevosErrores.confirmPassword = "Este campo es obligatorio";
    if (formData.password !== formData.confirmPassword)
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";

    // Persona física
    if (esFisica) {
      if (!formData.nombre) nuevosErrores.nombre = "Este campo es obligatorio";
      if (!formData.apellido)
        nuevosErrores.apellido = "Este campo es obligatorio";
      if (!formData.dni) nuevosErrores.dni = "Este campo es obligatorio";
      if (!formData.cuil) nuevosErrores.cuil = "Este campo es obligatorio";

      const { calle, departamento } = formData.direccion;
      if (!calle || !departamento) {
        nuevosErrores.direccion = "Debe completar calle y departamento";
      }
    }

    // Persona jurídica
    if (esJuridica) {
      if (!formData.razonSocial)
        nuevosErrores.razonSocial = "Este campo es obligatorio";
      if (!formData.cuit)
        nuevosErrores.cuit = "CUIT de la empresa es obligatorio";

      const { calle, departamento } = formData.direccionEmpresa;
      if (!calle || !departamento) {
        nuevosErrores.direccionEmpresa =
          "Debe completar calle y departamento de la empresa";
      }

      if (!formData.dniResponsable)
        nuevosErrores.dniResponsable = "Este campo es obligatorio";
      if (!formData.nombreResponsable)
        nuevosErrores.nombreResponsable = "Nombre del responsable faltante";
      if (!formData.apellidoResponsable)
        nuevosErrores.apellidoResponsable = "Apellido del responsable faltante";
      if (!formData.cuitResponsable)
        nuevosErrores.cuitResponsable = "CUIT del responsable faltante";

      const { calle: calleRes, departamento: depRes } =
        formData.domicilioResponsable;
      if (!calleRes || !depRes) {
        nuevosErrores.domicilioResponsable =
          "Debe completar calle y departamento del responsable";
      }
    }

    setErrors(nuevosErrores);
    // console.log("🧾 Errores validados:", nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const esValido = validarCampos();

    if (!esValido) {
      setNotification({
        message: "Por favor, corregí los errores del formulario.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.tipo === "fisica" && !renaperData) {
      setNotification({
        message: "No se puede registrar: Persona no validada con RENAPER.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    const isFisica = formData.tipo === "fisica";
    const isJuridica = formData.tipo === "juridica";

    const userData = {
      tipo: formData.tipo,
      email: formData.email,
      password: formData.password,
      cuit: isJuridica ? formData.cuit : formData.cuil, // Para la DB, cuil o cuit van en el mismo campo si es empresa
      cuil: isFisica ? formData.cuil : formData.cuit, // Asegura que el backend reciba 'cuil'
      razonSocial: isJuridica ? formData.razonSocial : null,

      // Datos principales del usuario
      nombre: isFisica ? formData.nombre : formData.nombreResponsable,
      apellido: isFisica ? formData.apellido : formData.apellidoResponsable,
      dni: isFisica ? formData.dni : formData.dniResponsable,

      // Dirección del usuario/responsable
      direccion: isFisica
        ? {
            calle: formData.direccion.calle,
            altura: formData.direccion.altura,
            barrio: formData.direccion.barrio || null,
            departamento: formData.direccion.departamento,
          }
        : {
            calle: formData.domicilioResponsable.calle,
            altura: formData.domicilioResponsable.altura,
            barrio: formData.domicilioResponsable.barrio || null,
            departamento: formData.domicilioResponsable.departamento,
          },

      // Datos del responsable (solo si es jurídica)
      dniResponsable: isJuridica ? formData.dniResponsable : null,
      nombreResponsable: isJuridica ? formData.nombreResponsable : null,
      apellidoResponsable: isJuridica ? formData.apellidoResponsable : null,
      cuitResponsable: isJuridica ? formData.cuitResponsable : null,
      domicilioResponsable: isJuridica
        ? {
            calle: formData.domicilioResponsable.calle,
            altura: formData.domicilioResponsable.altura,
            barrio: formData.domicilioResponsable.barrio || null,
            departamento: formData.domicilioResponsable.departamento,
          }
        : null,

      // Dirección de la empresa se maneja en backend
      direccionEmpresa: isJuridica
        ? {
            calle: formData.direccionEmpresa.calle,
            altura: formData.direccionEmpresa.altura,
            departamento: formData.direccionEmpresa.departamento,
          }
        : null,

      rolDefinitivo: "usuario",
    };

    // console.log("📤 Enviando al backend:", userData);

    try {
      const resultAction = await dispatch(register(userData));

      if (register.fulfilled.match(resultAction)) {
        localStorage.setItem("userData", JSON.stringify(resultAction.payload));
        setNotification({
          message: "✅ Registro exitoso. Redirigiendo...",
          type: "success",
        });
        setTimeout(() => (window.location.href = "/"), 3000);
      } else {
        setNotification({
          message: resultAction.payload || "❌ Error durante el registro.",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: "❌ Ocurrió un error inesperado.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (renaperData) {
      setFormData((prev) => ({
        ...prev,
        nombre: renaperData.nombres,
        apellido: renaperData.apellidos,
        // ✅ Preservamos la dirección si ya fue seteada
        direccion: {
          ...prev.direccion,
        },
      }));
    }
  }, [renaperData]);

  return (
    <div className="font-sans bg-white w-full md:flex md:items-center md:justify-center rounded-lg">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto p-6">
        <div className="hidden md:block">
          <img
            src={registerImage}
            className="w-full h-auto object-cover"
            alt="register-image"
          />
        </div>
        <div className="bg-gray-50 p-8 md:p-12 rounded-lg shadow-lg overflow-auto">
          <h3 className="text-blue-500 text-3xl font-extrabold text-center md:text-left mb-8">
            Crea una cuenta
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de sujeto */}
            <div className="mb-6">
              <label
                className="text-gray-800 text-xs block mb-2"
                htmlFor="tipo"
              >
                Tipo de Sujeto
              </label>
              <div className="flex items-center space-x-4">
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="fisica"
                    checked={formData.tipo === "fisica"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Persona Humana
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="juridica"
                    checked={formData.tipo === "juridica"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Persona Jurídica
                </label>
              </div>
            </div>

            {/* Persona Jurídica */}
            {formData.tipo === "juridica" && (
              <>
                {step === 1 && (
                  <>
                    <div className="mb-4">
                      <span className="text-blue-600 font-bold text-sm">Paso 1 de 2: Datos de la Empresa</span>
                    </div>
                <div className="mb-6">
                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="razonSocial"
                  >
                    Razón Social
                  </label>
                  <input
                    id="razonSocial"
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    placeholder="Ingresa la razón social"
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="cuit"
                  >
                    CUIT de la Empresa
                  </label>
                  <input
                    id="cuit"
                    type="text"
                    name="cuit"
                    value={formData.cuit}
                    onChange={handleChange}
                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    placeholder="Ingresa el CUIT de la empresa"
                  />
                  {errors.cuit && (
                    <p className="text-red-500 text-xs mt-2">{errors.cuit}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      className="text-gray-800 text-xs block mb-2"
                      htmlFor="calleEmpresa"
                    >
                      Calle Empresa
                    </label>
                    <input
                      id="calleEmpresa"
                      type="text"
                      name="calleEmpresa"
                      value={formData.direccionEmpresa.calle}
                      onChange={handleChange}
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                      placeholder="Ingresa la calle"
                    />
                  </div>
                  <div>
                    <label
                      className="text-gray-800 text-xs block mb-2"
                      htmlFor="alturaEmpresa"
                    >
                      Numeración Empresa
                    </label>
                    <input
                      id="alturaEmpresa"
                      type="text"
                      name="alturaEmpresa"
                      value={formData.direccionEmpresa.altura}
                      onChange={handleChange}
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                      placeholder="Ingresa la numeración"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      className="text-gray-800 text-xs block mb-2"
                      htmlFor="departamentoEmpresa"
                    >
                      Departamento Empresa
                    </label>
                    <select
                      id="departamentoEmpresa"
                      name="departamentoEmpresa"
                      value={formData.direccionEmpresa.departamento}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          direccionEmpresa: {
                            ...prev.direccionEmpresa,
                            departamento: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    >
                      <option value="">Selecciona un departamento</option>
                      {departments.map((dep, idx) => (
                        <option key={idx} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition mb-6"
                >
                  Continuar a Datos del Responsable ➡️
                </button>
                </>
              )}

              {step === 2 && (
                <>
                {/* Responsable legal */}
                <div className="mb-6 mt-2">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <span className="text-blue-600 font-bold text-sm">
                      Paso 2 de 2: Responsable de la Empresa
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-blue-500 text-xs font-semibold hover:underline"
                    >
                      ⬅️ Volver a la Empresa
                    </button>
                  </div>

                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="dniResponsable"
                  >
                    DNI del Responsable
                  </label>
                  <>
                    <input
                      id="dniResponsable"
                      type="text"
                      name="dniResponsable"
                      value={formData.dniResponsable}
                      onChange={handleChange}
                      onBlur={() => {
                        if (
                          formData.dniResponsable &&
                          formData.dniResponsable.length >= 7
                        ) {
                          setLoadingRenaper(true);
                          validateDNIResponsableWithRenaper(
                            formData.dniResponsable,
                          );
                        }
                      }}
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                      placeholder="DNI del responsable"
                    />

                    {/* 🆕 BOTÓN MANUAL PARA RESPONSABLE */}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          formData.dniResponsable &&
                          formData.dniResponsable.length >= 7
                        ) {
                          setLoadingRenaper(true);
                          validateDNIResponsableWithRenaper(
                            formData.dniResponsable,
                          );
                        }
                      }}
                      disabled={
                        !formData.dniResponsable ||
                        formData.dniResponsable.length < 7 ||
                        loadingRenaper
                      }
                      className="mt-2 px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loadingRenaper
                        ? "Validando..."
                        : "Validar DNI Responsable"}
                    </button>

                    {loadingRenaper && (
                      <p className="text-blue-500 text-xs mt-2">
                        🔄 Validando DNI del responsable...
                      </p>
                    )}

                    {renaperError && (
                      <p className="text-red-500 text-xs mt-2">
                        {renaperError}
                      </p>
                    )}
                  </>

                  {/* CUIT del responsable */}
                  <div className="mb-6 mt-4">
                    <label
                      className="text-gray-800 text-xs block mb-2"
                      htmlFor="cuitResponsable"
                    >
                      CUIT del Responsable
                    </label>
                    <input
                      id="cuitResponsable"
                      type="text"
                      name="cuitResponsable"
                      value={formData.cuitResponsable}
                      readOnly
                      className="w-full bg-gray-100 text-sm border-b border-gray-300 px-2 py-3 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        className="text-gray-800 text-xs block mb-2"
                        htmlFor="nombreResponsable"
                      >
                        Nombre
                      </label>
                      <input
                        id="nombreResponsable"
                        type="text"
                        name="nombreResponsable"
                        value={formData.nombreResponsable}
                        readOnly
                        className="w-full bg-gray-100 text-sm border-b border-gray-300 px-2 py-3 outline-none"
                      />
                    </div>
                    <div>
                      <label
                        className="text-gray-800 text-xs block mb-2"
                        htmlFor="apellidoResponsable"
                      >
                        Apellido
                      </label>
                      <input
                        id="apellidoResponsable"
                        type="text"
                        name="apellidoResponsable"
                        value={formData.apellidoResponsable}
                        readOnly
                        className="w-full bg-gray-100 text-sm border-b border-gray-300 px-2 py-3 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        className="text-gray-800 text-xs block mb-2"
                        htmlFor="calleResponsable"
                      >
                        Calle
                      </label>
                      <input
                        id="calleResponsable"
                        type="text"
                        name="calleResponsable"
                        value={formData.domicilioResponsable.calle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            domicilioResponsable: {
                              ...prev.domicilioResponsable,
                              calle: e.target.value,
                            },
                          }))
                        }
                        className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                      />
                    </div>
                    <div>
                      <label
                        className="text-gray-800 text-xs block mb-2"
                        htmlFor="alturaResponsable"
                      >
                        Numeración
                      </label>
                      <input
                        id="alturaResponsable"
                        type="text"
                        name="alturaResponsable"
                        value={formData.domicilioResponsable.altura}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            domicilioResponsable: {
                              ...prev.domicilioResponsable,
                              altura: e.target.value,
                            },
                          }))
                        }
                        className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="departamentoResponsable"
                  >
                    Departamento Responsable
                  </label>
                  {!formData.provinciaResponsable ||
                  esDeMendoza(formData.provinciaResponsable) ? (
                    <select
                      id="departamentoResponsable"
                      name="departamentoResponsable"
                      value={formData.domicilioResponsable.departamento}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          domicilioResponsable: {
                            ...prev.domicilioResponsable,
                            departamento: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    >
                      <option value="">Selecciona un departamento</option>
                      {departments.map((dep, idx) => (
                        <option key={idx} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="departamentoResponsable"
                      name="departamentoResponsable"
                      value={formData.domicilioResponsable.departamento}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          domicilioResponsable: {
                            ...prev.domicilioResponsable,
                            departamento: e.target.value,
                          },
                        }))
                      }
                      placeholder="Ingresá tu departamento o localidad"
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    />
                  )}

                  {/* 💬 INFO EXTRA para que el usuario sepa de qué provincia es */}
                  {formData.provinciaResponsable && (
                    <p className="text-sm text-gray-600 mt-1">
                      Provincia detectada del responsable:{" "}
                      <strong>{formData.provinciaResponsable}</strong>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition mb-6"
                >
                  Continuar a Credenciales de Acceso ➡️
                </button>
              </>
            )}
            </>
          )}

          {/* Persona física */}
            {formData.tipo === "fisica" && (
              <>
                <div className="mb-6">
                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="dni"
                  >
                    DNI
                  </label>
                  <input
                    id="dni"
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    onBlur={() => {
                      if (formData.dni && formData.dni.length >= 7) {
                        setLoadingRenaper(true);
                        validateDNIWithRenaper(formData.dni);
                      }
                    }}
                    className={`w-full text-black text-sm border-b ${errors.dni ? "border-red-500" : "border-gray-300"} focus:border-blue-500 px-2 py-3 outline-none`}
                    placeholder="Ingresa tu DNI"
                  />

                  {/* 🆕 BOTÓN MANUAL PARA MÓVILES */}
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.dni && formData.dni.length >= 7) {
                        setLoadingRenaper(true);
                        validateDNIWithRenaper(formData.dni);
                      }
                    }}
                    disabled={
                      !formData.dni || formData.dni.length < 7 || loadingRenaper
                    }
                    className="mt-2 px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loadingRenaper ? "Validando..." : "Validar DNI"}
                  </button>

                  {loadingRenaper && (
                    <p className="text-blue-500 text-xs mt-2">
                      🔄 Validando DNI...
                    </p>
                  )}

                  {errors.dni && (
                    <p className="text-red-500 text-xs mt-2">{errors.dni}</p>
                  )}
                  {renaperError && (
                    <p className="text-red-500 text-xs mt-2">{renaperError}</p>
                  )}

                  {renaperData && !renaperError && (
                    <p className="text-green-500 text-xs mt-2">
                      ✅ DNI validado correctamente
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      className="text-gray-800 text-xs block mb-2"
                      htmlFor="nombre"
                    >
                      Nombre
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full text-black text-sm border-b ${errors.nombre ? "border-red-500" : "border-gray-300"} focus:border-blue-500 px-2 py-3 outline-none`}
                      placeholder="Ingresa tu nombre"
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.nombre}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="text-gray-800 text-xs block mb-2"
                      htmlFor="apellido"
                    >
                      Apellido
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className={`w-full text-black text-sm border-b ${errors.apellido ? "border-red-500" : "border-gray-300"} focus:border-blue-500 px-2 py-3 outline-none`}
                      placeholder="Ingresa tu apellido"
                    />
                    {errors.apellido && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.apellido}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dirección física */}
                <div className="mb-6">
                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="calle"
                  >
                    Calle
                  </label>
                  <input
                    id="calle"
                    type="text"
                    name="calle"
                    value={formData.direccion.calle}
                    onChange={handleChange}
                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    placeholder="Ingresa la calle"
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="altura"
                  >
                    Numeración
                  </label>
                  <input
                    id="altura"
                    type="text"
                    name="altura"
                    value={formData.direccion.altura}
                    onChange={handleChange}
                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    placeholder="Ingresa la numeración"
                  />
                </div>

                <div className="mb-6">
                  <label
                    className="text-gray-800 text-xs block mb-2"
                    htmlFor="departamento"
                  >
                    Departamento / Localidad
                  </label>

                  {!formData.provincia || esDeMendoza(formData.provincia) ? (
                    <select
                      id="departamento"
                      name="departamento"
                      value={formData.direccion.departamento}
                      onChange={handleChange}
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    >
                      <option value="">Selecciona un departamento</option>
                      {departments.map((dep, index) => (
                        <option key={index} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="departamento"
                      name="departamento"
                      value={formData.direccion.departamento}
                      onChange={handleChange}
                      placeholder="Ingresá tu departamento o localidad"
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    />
                  )}

                  {!esDeMendoza(formData.provincia) && (
                    <p className="text-xs text-gray-600 mt-2">
                      🌎 Provincia detectada:{" "}
                      <strong>{formData.provincia || "Desconocida"}</strong>
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Email, contraseñas y botón submit (Solo en Física o Jurídica Paso 3) */}
            {(formData.tipo === "fisica" || (formData.tipo === "juridica" && step === 3)) && (
              <>
                {formData.tipo === "juridica" && (
                  <div className="flex justify-between items-center mb-4 border-b pb-2 mt-2">
                    <span className="text-blue-600 font-bold text-sm">
                      Paso 3 de 3: Credenciales de Acceso
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-blue-500 text-xs font-semibold hover:underline"
                    >
                      ⬅️ Volver al Responsable
                    </button>
                  </div>
                )}
            <div className="mb-6">
              <label
                className="text-gray-800 text-xs block mb-2"
                htmlFor="email"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full text-black text-sm border-b ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-blue-500 px-2 py-3 outline-none`}
                placeholder="Ingresa tu correo electrónico"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2">{errors.email}</p>
              )}
            </div>

            {/* Contraseñas */}
            <div className="mb-6 relative">
              <label
                className="text-gray-800 text-xs block mb-2"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full text-black text-sm border-b ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-blue-500 px-2 py-3 outline-none`}
                placeholder="Ingresa tu contraseña"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-2">{errors.password}</p>
              )}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-9 text-blue-500 text-xs"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <div className="mb-6">
              <label
                className="text-gray-800 text-xs block mb-2"
                htmlFor="confirmPassword"
              >
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full text-black text-sm border-b ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} focus:border-blue-500 px-2 py-3 outline-none`}
                placeholder="Reingresa tu contraseña"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </button>
            </>
            )}
          </form>

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
