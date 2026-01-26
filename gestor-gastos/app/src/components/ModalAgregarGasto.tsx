import { FormularioGasto } from './FormularioGasto';
import { ModalBase } from './ModalBase';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string) => void;
}

export const ModalAgregarGasto = ({ visible, onClose, onAgregar }: Props) => {
  const handleAgregar = (monto: number, descripcion: string, categoria: string, moneda?: string) => {
    console.log('🎯 ModalAgregarGasto - handleAgregar recibió:', { monto, descripcion, categoria, moneda });
    onAgregar(monto, descripcion, categoria, moneda);
    onClose();
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="📜 Nuevo Gasto"
      position="center"
      maxHeight="85%"
    >
      <FormularioGasto onAgregar={handleAgregar} />
    </ModalBase>
  );
};