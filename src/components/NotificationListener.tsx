import { useOrderNotifications } from '../hooks/useOrderNotifications'

export default function NotificationListener() {
  useOrderNotifications()
  return null
}
