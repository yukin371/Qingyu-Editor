/**
 * Qingyu Design System Components
 * Unified export for all Qingyu-style components
 */

// Basic Components (with backward compatibility aliases)
export { default as QyButton } from './basic/QyButton'
export { default as Button } from './basic/QyButton'
export { default as QyCard } from './basic/QyCard'
export { default as Card } from './basic/QyCard'
export { default as QyInput } from './basic/QyInput'
export { default as Input } from './basic/QyInput'
export { default as QyBadge } from './basic/QyBadge'
export { default as Badge } from './basic/QyBadge'
export { default as QyAvatar } from './basic/QyAvatar'
export { default as Avatar } from './basic/QyAvatar'
export { default as QyIcon } from './basic/QyIcon'
export { default as Icon } from './basic/QyIcon'
export { default as QyTag } from './basic/QyTag'
export { default as Tag } from './basic/QyTag'
export { default as QyCheckbox } from './basic/QyCheckbox'
export { default as Checkbox } from './basic/QyCheckbox'
export { QyCheckboxGroup, default as CheckboxGroup } from './basic/QyCheckbox'
export { default as QyRadio } from './basic/QyRadio'
export { default as Radio } from './basic/QyRadio'
export { QyRadioGroup, default as RadioGroup } from './basic/QyRadio'
export { default as QySwitch } from './basic/QySwitch'
export { default as Switch } from './basic/QySwitch'
export { default as QySlider } from './basic/QySlider'
export { default as Slider } from './basic/QySlider'
export { default as QyTextarea } from './basic/QyTextarea'
export { default as Textarea } from './basic/QyTextarea'
// QySelect: Apple-style select (form/Select) replaces basic/QySelect
export { QySelect } from '../form/Select'
export { Select } from '../form/Select'
export { default as QyRate } from './basic/QyRate'
export { default as Rate } from './basic/QyRate'
export { default as QyScrollbar } from './basic/QyScrollbar'
export { default as Scrollbar } from './basic/QyScrollbar'
export { default as QyImage } from './basic/QyImage'
export { default as Image } from './basic/QyImage'
export { default as QyGhostButton } from './basic/QyGhostButton'

// Navigation Components
export { default as QyTopNav } from './navigation/QyTopNav'
export { default as QyBottomDock } from './navigation/QyBottomDock'
export { default as QyTabBar } from './navigation/QyTabBar'
// QyDropdown: Apple-style dropdown from navigation/Dropdown
export { QyDropdown } from '../navigation/Dropdown'

// Feedback Components (Dialog, Toast, etc.)
export { QyDialog } from '../feedback/Dialog'
export { QyConfirmDialog } from './advanced/QyConfirmDialog'

// Advanced Components
export { default as QyModal } from './advanced/QyModal'
export { default as QyLoading } from './advanced/QyLoading'
export { default as QyEmpty } from './advanced/QyEmpty'
export { QyForm, QyFormItem } from './advanced/QyForm'

// Admin Components
export { default as QyAdminTable } from './advanced/QyAdminTable'
export { default as QyAdminDialog } from './advanced/QyAdminDialog'
export { default as QyAdminForm } from './advanced/QyAdminForm'

// Feedback Components
export { default as QyTooltip } from './feedback/QyTooltip'
export { default as QyAlert } from './feedback/QyAlert'
export { default as QyDrawer } from './feedback/QyDrawer'

// Business Components
export { default as QyBookCard } from './business/QyBookCard'
export { default as QyBookCover } from './business/QyBookCover'
export { default as QyUserCard } from './business/QyUserCard'
export { default as QyCommentItem } from './business/QyCommentItem'
export { QyTree, QyTreeSelect } from './business/QyTree'

// Data Display Components
export { default as QyDivider } from './data/QyDivider'
export { default as QyProgress } from './data/QyProgress'
export { default as QyPagination } from './data/QyPagination'
export { QyRow, QyCol } from './data/QyGrid'
export { QyDescriptions, QyDescriptionsItem } from './data/QyDescriptions'
export { QyButtonGroup } from './basic/QyButtonGroup'
export { QyInputNumber } from './basic/QyInputNumber'
export { QyDatePicker } from './basic/QyDatePicker'
export { Table } from '../data/Table'
export { Tabs, TabPane } from '../data/Tabs'
export { Timeline, TimelineItem } from '../data/Timeline'
export { Skeleton } from '../base/Skeleton'

// Re-export types
export type * from './basic/QyButton/types'
export type * from './basic/QyCard/types'
export type * from './basic/QyInput/types'
export type * from './basic/QyBadge/types'
export type * from './basic/QyAvatar/types'
export type * from './basic/QyIcon/types'
export type * from './basic/QyCheckbox/types'
export type * from './basic/QyRadio/types'
export type * from './basic/QySwitch/types'
export type * from './basic/QySlider/types'
export type * from './basic/QyTextarea/types'
// QySelect types from form/Select (Apple-style)
export type { SelectOption, SelectProps, SelectEmits } from '../form/Select/types'
export type { SelectOption as QySelectOption } from '../form/Select/types'
export type * from './basic/QyRate/types'
export type * from './basic/QyScrollbar/types'
export type * from './basic/QyImage/types'
export type * from './basic/QyGhostButton/types'
export type * from './navigation/QyTopNav/types'
export type * from './navigation/QyBottomDock/types'
export type * from './navigation/QyTabBar/types'
// QyDropdown types from navigation/Dropdown
export type {
  QyDropdownProps,
  DropdownItem,
  DropdownTrigger,
  DropdownPlacement,
} from '../navigation/Dropdown/types'
export type * from './advanced/QyModal/types'
export type * from './advanced/QyLoading/types'
export type * from './advanced/QyEmpty/types'
export type * from './advanced/QyForm/types'
export type * from './advanced/QyConfirmDialog/types'
export type * from './business/QyBookCard/types'
export type * from './business/QyBookCover/types'
export type * from './business/QyUserCard/types'
export type * from './business/QyCommentItem/types'
export type * from './feedback/QyTooltip/types'
export type * from './feedback/QyAlert/types'
export type * from './feedback/QyDrawer/types'
export type * from './data/QyDivider/types'
export type * from './data/QyProgress/types'
export type * from './data/QyPagination/types'
export type { TimelineProps, TimelineItemProps } from '../data/Timeline/types'
export type * from './data/QyGrid/types'
export type * from './data/QyDescriptions/types'

// Backward compatibility type aliases
import type { QyButtonProps } from './basic/QyButton/types'
import type { QyInputProps } from './basic/QyInput/types'
import type { QyTextareaProps } from './basic/QyTextarea/types'
import type { QyCheckboxProps } from './basic/QyCheckbox/types'
import type { QyRadioProps } from './basic/QyRadio/types'
import type { QySwitchProps } from './basic/QySwitch/types'
import type { QySliderProps } from './basic/QySlider/types'
import type { QyAvatarProps } from './basic/QyAvatar/types'
import type { QyBadgeProps } from './basic/QyBadge/types'
import type { QyTagProps } from './basic/QyTag/types'
import type { QyIconProps } from './basic/QyIcon/types'
import type { QyImageProps } from './basic/QyImage/types'
import type { QyCardProps } from './basic/QyCard/types'
import type { RateProps as QyRateProps } from './basic/QyRate/types'

// Export backward compatibility type aliases
export type ButtonProps = QyButtonProps
export type InputProps = QyInputProps
export type TextareaProps = QyTextareaProps
// SelectProps is already exported directly from ../form/Select/types above
export type CheckboxProps = QyCheckboxProps
export type RadioProps = QyRadioProps
export type SwitchProps = QySwitchProps
export type SliderProps = QySliderProps
export type AvatarProps = QyAvatarProps
export type BadgeProps = QyBadgeProps
export type IconProps = QyIconProps
export type ImageProps = QyImageProps
export type CardProps = QyCardProps
export type RateProps = QyRateProps
export type TagProps = QyTagProps
