import styles from "./HonorsAndAwards.module.css";

const TERMINAL_ROWS = [
	["platform", "codeforces"],
	["focus", "algorithms & data structures"],
	["active since", "2021"],
] as const;

export default function CodeforcesWidget() {
	return <div className={styles.terminalContainer}>
		<div className={styles.terminal}>
			<div className={styles.terminalHeader}>
				<span className={styles.terminalPrompt}>&gt;_</span>
				<span>PROFILE</span>
			</div>
			<div className={styles.terminalDivider} />
			{TERMINAL_ROWS.map(([key, val]) => (
				<div key={key} className={styles.terminalRow}>
					<span className={styles.terminalKey}>{key}</span>
					<span className={styles.terminalVal}>{val}</span>
				</div>
			))}
			<div className={styles.terminalMidRule} />
			<a
				href="https://codeforces.com/profile/Stanescu_Octav"
				target="_blank"
				rel="noopener noreferrer"
				className={styles.profileLink}
			>
				<span>→</span>
				<span>view codeforces profile</span>
			</a>
		</div>
	</div>
}