import Swal from 'sweetalert2';
import { SwalHelper } from './swalHelper';

export const openOtpSwal = (options) => {
    SwalHelper.close(); // close anything open  
    return Swal.fire(options);
};