package expo.modules.roamingguard


data class RoamingZone(
    val id: String,
    val name: String,
    val countries: Set<String>
)

object RoamingZones {

    private val zones = listOf(RoamingZone(
            id = "eu-roaming-zone-1",
            name = "EU Roaming Zone 1",
            countries = setOf("AT","BE","BG","HR","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK")
        )
    )

    fun getAll(): List<RoamingZone> {
        return zones
    }

    fun findById(zoneId: String): RoamingZone? {
        return zones.find { zone ->
            zone.id == zoneId
        }
    }
}
