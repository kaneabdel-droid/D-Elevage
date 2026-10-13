import { redirect } from 'next/navigation'

export default function NouveauSuiviRedirectPage() {
  redirect('/elevage/suivi?nouveau=1')
}
